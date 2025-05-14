import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Card,
    TextField,
    Button,
    List,
    ListItem,
    Avatar,
    Divider,
    IconButton,
    AppBar,
    Toolbar,
    Slide,
    CircularProgress
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { FaCamera, FaMicrophone, FaImage, FaBookOpen, FaGamepad } from 'react-icons/fa';
import { IoSend } from 'react-icons/io5';
import EmojiPicker from 'emoji-picker-react';
import ImageMessage from './ImageMessage.jsx';
import GomokuInviteCard from './GomokuInviteCard.jsx';
import { renderStars, renderCookbookCard } from './utils.js';
import baseUrl from './config.js';
import apiRequest from './api.js';


// 聊天页面组件
const ChatPage = ({ navigate, selectedFriend, friendMessages, newMessage, setNewMessage, handleSendMessage, handleKeyPress, showEmojiPicker, setShowEmojiPicker, handleEmojiClick, emojiIconRef, emojiPickerRef, selfAvatar, inputRef, onBack, handleShareCookbookClick, handleReadMessage, handleShowGames ,setFriendMessages}) => {
    const chatListRef = useRef(null);
    const inputBoxRef = useRef(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const currentUserId = localStorage.getItem('userId');
    useEffect(() => {
        if (chatListRef.current) {
            chatListRef.current.scrollTop = chatListRef.current.scrollHeight;
        }
    }, [friendMessages]);

    useEffect(() => {
        if (selectedFriend) {
            handleReadMessage();
        }
    }, [selectedFriend]);

    // 处理图片选择
    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setSelectedImage(reader.result);
        };
        reader.readAsDataURL(file);
    };

    // 上传并发送图片消息
    const handleSendImage = async () => {
        if (!selectedImage || !selectedFriend) return;

        setIsUploading(true);

        try {
            // 从selectedImage中提取文件
            const fileInput = document.getElementById('fileInput');
            const file = fileInput.files[0];

            if (!file) {
                throw new Error('未选择图片');
            }

            // 上传图片
            const formData = new FormData();
            formData.append('file', file);

            const uploadResult = await apiRequest('/aliyun/upload', 'POST', formData, navigate);
            if (!uploadResult || uploadResult.code !== '200') {
                throw new Error(uploadResult?.message || '图片上传失败');
            }

            const fileId = uploadResult.data;

            // 发送图片消息
            const sendResult = await apiRequest('/send-message', 'POST', {
                userIdFrom: currentUserId,
                userIdTo: selectedFriend.id,
                messageType: 'image',
                messageContent: fileId
            }, navigate);

            if (sendResult && sendResult.code === '200') {
                // 更新消息列表
                setFriendMessages((prevMessages) => ({
                   ...prevMessages,
                    [selectedFriend.id]: [
                       ...(prevMessages[selectedFriend.id] || []),
                        {
                            text: fileId,
                            sender: 'user',
                            messageType: 'image',
                            isRead: true
                        }
                    ]
                }));
            } else {
                throw new Error(sendResult?.message || '发送图片消息失败');
            }

            // 重置状态
            setSelectedImage(null);
        } catch (error) {
            console.error('上传或发送图片消息出错:', error);
            // 显示错误提示
        } finally {
            setIsUploading(false);
        }
    };

    // 取消图片选择
    const handleCancelImage = () => {
        setSelectedImage(null);
        document.getElementById('fileInput').value = '';
    };

    return (
        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#f9f9f9', position: 'relative', height: '100vh' }}>
            {/* 原有AppBar部分 */}
            <AppBar position="sticky" sx={{ backgroundColor: '#fff' }}>
                <Toolbar>
                    <IconButton onClick={onBack}><ArrowBack /></IconButton>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', flexGrow: 1, textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '60%', color: '#333', textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)' }}>
                        {selectedFriend ? `正在和 ${selectedFriend.name} 聊天` : '请选择好友开始聊天'}
                    </Typography>
                </Toolbar>
            </AppBar>

            {/* 原有聊天列表部分 */}
            <List ref={chatListRef} sx={{ flexGrow: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', paddingBottom: '120px', marginBottom: '0' }}>
                {friendMessages[selectedFriend.id]?.map((message, index) => (
                    <ListItem key={index} alignItems="flex-start" sx={{ justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start', mb: 2, flexDirection: 'row' }}>
                        {message.sender === 'user' ? (
                            <>
                                <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'row', justifyContent: 'flex-end' }}>
                                    <Typography sx={{ fontSize: '0.8rem', color: message.isRead ? 'gray' : 'blue', marginRight: 2, flexDirection: 'row' }}>
                                        {message.isRead ? '已读' : '未读'}
                                    </Typography>
                                    {message.messageType === 'image' ? (
                                        <ImageMessage fileId={message.text} />
                                    ) : message.messageType === 'cookBook' ? (
                                        renderCookbookCard(JSON.parse(message.text))
                                    ) : message.messageType === 'Gomoku' ? (
                                        <GomokuInviteCard message={JSON.parse(message.text)} friend={selectedFriend} onJoin={(roomId) => navigate(`/gomoku?roomId=${roomId}`)} userIdTo={message.userIdTo} />
                                    ) : (
                                        <Box sx={{ backgroundColor: '#DCF8C6', borderRadius: 3, padding: '8px', maxWidth: '90%', wordBreak: 'break-word', whiteSpace: 'pre-wrap', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)' }}>
                                            {message.text}
                                        </Box>
                                    )}
                                </Box>
                                <Avatar>{selfAvatar}</Avatar>
                            </>
                        ) : (
                            <>
                                <Avatar sx={{ marginRight: 2 }}>{selectedFriend.avatar}</Avatar>
                                <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'row' }}>
                                    {message.messageType === 'image' ? (
                                        <ImageMessage fileId={message.text} />
                                    ) : message.messageType === 'cookBook' ? (
                                        renderCookbookCard(JSON.parse(message.text))
                                    ) : message.messageType === 'Gomoku' ? (
                                        <GomokuInviteCard message={JSON.parse(message.text)} friend={selectedFriend} onJoin={(roomId) => navigate(`/gomoku?roomId=${roomId}`)} userIdTo={message.userIdTo} />
                                    ) : (
                                        <Box sx={{ backgroundColor: '#E5E5EA', borderRadius: 3, padding: '8px', maxWidth: '80%', wordBreak: 'break-word', whiteSpace: 'pre-wrap', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)' }}>
                                            {message.text}
                                        </Box>
                                    )}
                                    <Typography sx={{ fontSize: '0.8rem', color: message.isRead ? 'gray' : 'blue', marginLeft: 2, flexDirection: 'row' }}>
                                        {message.isRead ? '已读' : '未读'}
                                    </Typography>
                                </Box>
                            </>
                        )}
                    </ListItem>
                ))}
            </List>

            {/* 底部输入区域 */}
            <Box sx={{ display: 'flex', flexDirection: 'column', position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1, backgroundColor: '#fff', borderTop: '1px solid #e0e0e0' }}>
                {/* 输入框和发送按钮 */}
                <Box sx={{ padding: '8px 16px', display: 'flex', alignItems: 'center' }}>
                    <TextField ref={inputRef} fullWidth multiline rows={1} value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyPress={handleKeyPress} placeholder="输入消息..." sx={{ '& fieldset': { borderWidth: '2px', borderRadius: '10px' }, height: 60, padding: '2px', backgroundColor: '#f5f5f5' }} inputProps={{ style: { paddingTop: '0px', paddingBottom: '0px', fontSize: '18px' } }} />
                    <Button variant="contained" onClick={handleSendMessage} sx={{ background: '#0084ff', '&:hover': { background: '#0066cc' }, marginLeft: 1, height: 40, width: 40, borderRadius: 50 }}><IoSend /></Button>
                </Box>

                {/* 功能按钮区 */}
                <Box sx={{ padding: '8px 16px', display: 'flex', justifyContent: 'space-around', borderTop: '1px solid #f0f0f0' }}>
                    <IconButton ref={emojiIconRef} onClick={() => setShowEmojiPicker(!showEmojiPicker)} sx={{ width: 40, height: 40, color: 'inherit' }}><span style={{ fontSize: '20px' }}>😊</span></IconButton>
                    <IconButton sx={{ width: 40, height: 40 }} onClick={() => document.getElementById('fileInput').click()}><FaImage /></IconButton>
                    <input
                        id="fileInput"
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handleImageSelect}
                    />
                    <IconButton sx={{ width: 40, height: 40 }} onClick={() => document.getElementById('cameraInput').click()}><FaCamera /></IconButton>
                    <input id="cameraInput" type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={(e) => { const file = e.target.files[0]; if (file) { console.log('拍照文件:', file); } }} />
                    <IconButton sx={{ width: 40, height: 40 }} onClick={handleShareCookbookClick}><FaBookOpen /></IconButton>
                    <IconButton sx={{ width: 40, height: 40 }} onClick={handleShowGames}><FaGamepad /></IconButton>
                    <IconButton sx={{ width: 40, height: 40 }}><FaMicrophone /></IconButton>
                </Box>

                {/* 表情选择器 */}
                {showEmojiPicker && (
                    <Slide direction="up" in={showEmojiPicker} mountOnEnter unmountOnExit style={{ position: 'absolute', bottom: 120, left: 16, zIndex: 2 }}>
                        <Box ref={emojiPickerRef} sx={{ backgroundColor: '#fff', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)', borderRadius: 8, padding: '8px' }}>
                            <EmojiPicker onEmojiClick={handleEmojiClick} />
                        </Box>
                    </Slide>
                )}

                {/* 图片预览与上传区域 */}
                {selectedImage && (
                    <Box sx={{ position: 'absolute', bottom: 120, left: 16, right: 16, zIndex: 3, backgroundColor: 'white', borderRadius: '8px', padding: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                        <Box sx={{ position: 'relative', maxHeight: '200px', overflow: 'hidden', borderRadius: '4px' }}>
                            <img
                                src={selectedImage}
                                alt="预览"
                                style={{ width: '100%', height: 'auto', maxHeight: '200px', objectFit: 'contain' }}
                            />

                            {/* 上传加载动画 */}
                            {isUploading && (
                                <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    <CircularProgress color="primary" />
                                </Box>
                            )}
                        </Box>

                        {/* 操作按钮 */}
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                            <Button
                                variant="outlined"
                                color="primary"
                                onClick={handleCancelImage}
                                sx={{ marginRight: '8px' }}
                            >
                                取消
                            </Button>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleSendImage}
                                disabled={isUploading}
                            >
                                {isUploading ? '上传中...' : '发送'}
                            </Button>
                        </Box>
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default ChatPage;