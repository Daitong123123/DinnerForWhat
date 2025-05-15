import React, { useState, useEffect, useRef, useCallback } from 'react';
import sha1 from 'js-sha1';
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
import { FaCamera, FaMicrophone, FaImage, FaBookOpen, FaGamepad, FaCut } from 'react-icons/fa';
import { IoSend } from 'react-icons/io5';
import EmojiPicker from 'emoji-picker-react';
import ImageMessage from './ImageMessage.jsx';
import GomokuInviteCard from './GomokuInviteCard.jsx';
import { renderStars, renderCookbookCard } from './utils.js';
import baseUrl from './config.js';
import apiRequest from './api.js';


// 聊天页面组件
const ChatPage = ({ navigate, selectedFriend, friendMessages, newMessage, setNewMessage, handleSendMessage, handleKeyPress, showEmojiPicker, setShowEmojiPicker, handleEmojiClick, emojiIconRef, emojiPickerRef, selfAvatar, inputRef, onBack, handleShareCookbookClick, handleReadMessage, handleShowGames, setFriendMessages }) => {
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

    const handleSendImage = async () => {
        if (!selectedImage || !selectedFriend) return;

        setIsUploading(true);

        try {
            // 1. 从File对象中读取二进制数据并计算哈希值
            const fileInput = document.getElementById('fileInput');
            const file = fileInput.files[0];
            if (!file) throw new Error('未选择图片');

            // 计算文件哈希值（使用SHA-1算法）
            const hash = await calculateFileHash(file);

            // 2. 调用后端接口检查文件是否已存在
            const existResult = await apiRequest('/aliyun/fileExist', 'GET', { hash }, navigate);
            if (existResult.code !== '200') {
                throw new Error(existResult.message || '文件存在性检查失败');
            }

            const cachedFileId = existResult.data;
            if (cachedFileId) { // 存在缓存文件，直接发送
                await sendImageMessage(cachedFileId);
            } else { // 不存在缓存，执行原上传流程
                const uploadResult = await uploadImage(file);
                const fileId = uploadResult.data;
                await sendImageMessage(fileId);
            }

            // 重置状态
            setSelectedImage(null);
            // 重置文件输入
            fileInput.value = '';
        } catch (error) {
            console.error('图片发送失败:', error);
            // 这里可以添加错误提示（如Toast）
        } finally {
            setIsUploading(false);
        }
    };
// 计算文件哈希值的辅助函数（不依赖 crypto.subtle）
const calculateFileHash = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);
  
      reader.onload = (e) => {
        try {
          const buffer = e.target.result;
          const uint8Array = new Uint8Array(buffer);
          const hashHex = sha1(uint8Array);
          resolve(hashHex);
        } catch (err) {
          reject(new Error(`哈希计算失败: ${err.message}`));
        }
      };
  
      reader.onerror = () => {
        reject(new Error('文件读取失败'));
      };
    });
  };

    

    // 发送图片消息的通用函数
    const sendImageMessage = async (fileId) => {
        const sendResult = await apiRequest('/send-message', 'POST', {
            userIdFrom: currentUserId,
            userIdTo: selectedFriend.id,
            messageType: 'image',
            messageContent: fileId
        }, navigate);

        if (sendResult.code === '200') {
            setFriendMessages((prevMessages) => ({
                ...prevMessages,
                [selectedFriend.id]: [
                    ...(prevMessages[selectedFriend.id] || []),
                    {
                        text: fileId,
                        sender: 'user',
                        messageType: 'image',
                        isRead: true // 假设发送即视为已读
                    }
                ]
            }));
        } else {
            throw new Error(sendResult.message || '发送图片消息失败');
        }
    };

    // 上传图片的辅助函数（保持原逻辑）
    const uploadImage = async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        const uploadResult = await apiRequest('/aliyun/upload', 'POST', formData, navigate);
        if (uploadResult.code !== '200') {
            throw new Error(uploadResult.message || '图片上传失败');
        }
        return uploadResult;
    };

    // 取消图片选择
    const handleCancelImage = () => {
        setSelectedImage(null);
        // 重置文件输入
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
                    <Box sx={{
                        position: 'fixed',
                        // 调整底部间距：功能按钮区高度（约56px）+ 输入框高度（约60px）+ 边距16px
                        bottom: '128px', // 原16px改为128px
                        left: 16,
                        backgroundColor: '#fff',
                        borderRadius: 4,
                        padding: 1,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        maxWidth: 'calc(100% - 32px)',
                        zIndex: 999
                    }}>
                        <Box sx={{
                            width: 150, // 固定预览宽度
                            height: 100, // 固定预览高度
                            overflow: 'hidden',
                            borderRadius: 3
                        }}>
                            <img
                                src={selectedImage}
                                alt="预览"
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'contain', // 保持比例，空白填充
                                    cursor: 'pointer'
                                }}
                            />
                        </Box>
                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            gap: 0.5,
                            padding: '4px 8px'
                        }}>
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={handleCancelImage}
                                sx={{ minWidth: '48px' }}
                            >
                                取消
                            </Button>
                            <Button
                                variant="contained"
                                size="small"
                                onClick={handleSendImage}
                                disabled={isUploading}
                                sx={{ minWidth: '48px' }}
                            >
                                {isUploading ? '上传中' : '发送'}
                            </Button>
                        </Box>
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default ChatPage;