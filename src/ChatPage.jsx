import React, { useEffect, useRef } from 'react';
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
    Slide
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { FaCamera, FaMicrophone, FaImage, FaBookOpen, FaGamepad } from 'react-icons/fa';
import { IoSend } from 'react-icons/io5';
import EmojiPicker from 'emoji-picker-react';
import GomokuInviteCard from './GomokuInviteCard.jsx';
import { renderStars, renderCookbookCard } from './utils.js';

// 聊天页面组件
const ChatPage = ({ navigate, selectedFriend, friendMessages, newMessage, setNewMessage, handleSendMessage, handleKeyPress, showEmojiPicker, setShowEmojiPicker, handleEmojiClick, emojiIconRef, emojiPickerRef, selfAvatar, inputRef, onBack, handleShareCookbookClick, handleReadMessage, handleShowGames }) => {
    const chatListRef = useRef(null);
    const inputBoxRef = useRef(null);

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

    return (
        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#f9f9f9', position: 'relative', height: '100vh' }}>
            <AppBar position="sticky" sx={{ backgroundColor: '#fff' }}>
                <Toolbar>
                    <IconButton onClick={onBack}><ArrowBack /></IconButton>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', flexGrow: 1, textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '60%', color: '#333', textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                        {selectedFriend ? `正在和 ${selectedFriend.name} 聊天` : '请选择好友开始聊天'}
                    </Typography>
                </Toolbar>
            </AppBar>
            <List ref={chatListRef} sx={{ flexGrow: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', paddingBottom: '120px', marginBottom: '0' }}>
                {friendMessages[selectedFriend.id]?.map((message, index) => (
                    <ListItem key={index} alignItems="flex-start" sx={{ justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start', mb: 2, flexDirection: 'row' }}>
                        {message.sender === 'user' ? (
                            <>
                                <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'row', justifyContent:'flex-end' }}>
                                    <Typography sx={{ fontSize: '0.8rem', color: message.isRead ? 'gray' : 'blue', marginRight: 2, flexDirection:'row' }}>
                                        {message.isRead ? '已读' : '未读'}
                                    </Typography>
                                    {message.messageType === 'cookBook' ? (
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
                                    {message.messageType === 'cookBook' ? (
                                        renderCookbookCard(JSON.parse(message.text))
                                    ) : message.messageType === 'Gomoku' ? (
                                        <GomokuInviteCard message={JSON.parse(message.text)} friend={selectedFriend} onJoin={(roomId) => navigate(`/gomoku?roomId=${roomId}`)} userIdTo={message.userIdTo} />
                                    ) : (
                                        <Box sx={{ backgroundColor: '#E5E5EA', borderRadius: 3, padding: '8px', maxWidth: '80%', wordBreak: 'break-word', whiteSpace: 'pre-wrap', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)' }}>
                                            {message.text}
                                        </Box>
                                    )}
                                    <Typography sx={{ fontSize: '0.8rem', color: message.isRead ? 'gray' : 'blue', marginLeft: 2, flexDirection:'row' }}>
                                        {message.isRead ? '已读' : '未读'}
                                    </Typography>
                                </Box>
                            </>
                        )}
                    </ListItem>
                ))}
            </List>
            <Box sx={{ display: 'flex', flexDirection: 'column', position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1, backgroundColor: '#fff', borderTop: '1px solid #e0e0e0' }}>
                <Box sx={{ padding: '8px 16px', display: 'flex', alignItems: 'center' }}>
                    <TextField ref={inputRef} fullWidth multiline rows={1} value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyPress={handleKeyPress} placeholder="输入消息..." sx={{ '& fieldset': { borderWidth: '2px', borderRadius: '10px' }, height: 60, padding: '2px', backgroundColor: '#f5f5f5' }} inputProps={{ style: { paddingTop: '0px', paddingBottom: '0px', fontSize: '18px' } }} />
                    <Button variant="contained" onClick={handleSendMessage} sx={{ background: '#0084ff', '&:hover': { background: '#0066cc' }, marginLeft: 1, height: 40, width: 40, borderRadius: 50 }}><IoSend /></Button>
                </Box>
                <Box sx={{ padding: '8px 16px', display: 'flex', justifyContent: 'space-around', borderTop: '1px solid #f0f0f0' }}>
                    <IconButton ref={emojiIconRef} onClick={() => setShowEmojiPicker(!showEmojiPicker)} sx={{ width: 40, height: 40, color: 'inherit' }}><span style={{ fontSize: '20px' }}>😊</span></IconButton>
                    <IconButton sx={{ width: 40, height: 40 }} onClick={() => document.getElementById('fileInput').click()}><FaImage /></IconButton>
                    <input id="fileInput" type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => { const file = e.target.files[0]; if (file) { console.log('Selected file:', file); } }} />
                    <IconButton sx={{ width: 40, height: 40 }} onClick={() => document.getElementById('cameraInput').click()}><FaCamera /></IconButton>
                    <input id="cameraInput" type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={(e) => { const file = e.target.files[0]; if (file) { console.log('拍照文件:', file); } }} />
                    <IconButton sx={{ width: 40, height: 40 }} onClick={handleShareCookbookClick}><FaBookOpen /></IconButton>
                    {/* 添加摇杆图标 */}
                    <IconButton sx={{ width: 40, height: 40 }} onClick={handleShowGames}><FaGamepad /></IconButton>
                    <IconButton sx={{ width: 40, height: 40 }}><FaMicrophone /></IconButton>
                </Box>
                {showEmojiPicker && (
                    <Slide direction="up" in={showEmojiPicker} mountOnEnter unmountOnExit style={{ position: 'absolute', bottom: 120, left: 16, zIndex: 2 }}>
                        <Box ref={emojiPickerRef} sx={{ backgroundColor: '#fff', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)', borderRadius: 8, padding: '8px' }}>
                            <EmojiPicker onEmojiClick={handleEmojiClick} />
                        </Box>
                    </Slide>
                )}
            </Box>
        </Box>
    );
};

export default ChatPage;    