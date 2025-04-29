import BottomNavigationBar from './BottomNavigationBar.jsx';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import GomokuInviteCard from './GomokuInviteCard.jsx';
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
    Tabs,
    Tab,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Slide,
    AppBar,
    Toolbar
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { FaUserPlus, FaCamera, FaMicrophone, FaImage, FaBookOpen ,FaChessBoard,FaGamepad} from 'react-icons/fa';
import { IoSend } from 'react-icons/io5';
import EmojiPicker from 'emoji-picker-react';
import apiRequest from './api.js';
import { Client } from '@stomp/stompjs';
import baseUrl from './config.js';

// 渲染星星的函数
const renderStars = (complex) => {
    return Array.from({ length: 10 }, (_, i) => (
        <span key={i} style={{ color: i < parseInt(complex, 10) ? '#FFD700' : '#ccc' }}>
            {i < parseInt(complex, 10) ? '★' : '☆'}
        </span>
    ));
};

// 渲染菜谱卡片的函数
const renderCookbookCard = (cookbook) => {
    return (
        <Card
            sx={{
                p: 3,
                background: '#f5e9d7', // 米色背景，模拟纸张颜色
                borderRadius: 8,
                border: '1px solid #d6c6b4',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                transition: 'box-shadow 0.3s',
                '&:hover': {
                    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)'
                },
                '@media (max-width: 600px)': {
                    width: '100%',
                    p: 2
                },
                maxWidth: '80%',
                fontFamily: 'Georgia, serif', // 更具亲和力的字体
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            <Typography variant="h5" sx={{ mb: 1, fontWeight: 'bold' }}>
                {cookbook.dishName}
            </Typography>
            <Typography variant="caption" sx={{ mb: 1, color: '#666' }}>
                复杂度: {renderStars(parseInt(cookbook.complex, 10))}
            </Typography>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mb: 2 }}>
                {cookbook.dishStep}
            </Typography>
            <hr style={{ border: '0.5px solid #d6c6b4', margin: '16px 0' }} />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                <div>
                    <Typography variant="body2" sx={{ color: 'green', fontWeight: 'bold' }}>
                        功效:
                    </Typography>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                        {cookbook.dishEffect}
                    </Typography>
                </div>
                <div>
                    <Typography variant="body2" sx={{ color: 'brown', fontWeight: 'bold' }}>
                        食材:
                    </Typography>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                        {cookbook.dishIngredients}
                    </Typography>
                </div>
                <div>
                    <Typography variant="body2" sx={{ color: 'orange', fontWeight: 'bold' }}>
                        花费:
                    </Typography>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                        {cookbook.dishCost}
                    </Typography>
                </div>
                <div>
                    <Typography variant="body2" sx={{ color: 'blue', fontWeight: 'bold' }}>
                        菜系:
                    </Typography>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                        {cookbook.dishFrom}
                    </Typography>
                </div>
                <div>
                    <Typography variant="body2" sx={{ color: 'purple', fontWeight: 'bold' }}>
                        口味:
                    </Typography>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                        {cookbook.tasty}
                    </Typography>
                </div>
            </div>
            {/* 模拟书页的阴影效果 */}
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0))',
                    pointerEvents: 'none'
                }}
            />
        </Card>
    );
};

// 聊天列表页面组件
const ChatListPage = ({ friends, onFriendSelect, selectedTab, setSelectedTab, friendRequests, onAddFriendClick, onRequestClick, handleAgreeRequest, handleDisagreeRequest, getStatusText }) => {
    const currentUserId = localStorage.getItem('userId');
    return (
        <Box sx={{ width: '100%', backgroundColor: '#fff', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderBottom: '1px solid #e0e0e0' }}>
                <Tabs value={selectedTab} onChange={(e, newValue) => setSelectedTab(newValue)} aria-label="friend tabs" textColor="primary" indicatorColor="primary">
                    <Tab label="我的好友" />
                    <Tab label="好友申请" />
                </Tabs>
                <IconButton onClick={onAddFriendClick}><FaUserPlus /></IconButton>
            </Box>
            <List sx={{ flexGrow: 1, overflowY: 'auto' }}>
                {selectedTab === 0 ? (
                    friends.map((friend) => (
                        <ListItem key={friend.id} onClick={() => onFriendSelect(friend)} sx={{ cursor: 'pointer', padding: '16px', '&:hover': { backgroundColor: '#f0f0f0' }, transition: 'background-color 0.2s ease' }}>
                            <Avatar sx={{ mr: 2 }}>{friend.avatar}</Avatar>
                            <Typography variant="subtitle1">{friend.name}</Typography>
                        </ListItem>
                    ))
                ) : (
                    <>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', padding: '16px' }}>好友请求</Typography>
                        {friendRequests.filter(req => req.requestTo === currentUserId).length === 0 && (
                            <ListItem sx={{ padding: '16px' }}><Typography>暂无好友请求</Typography></ListItem>
                        )}
                        {friendRequests.filter(req => req.requestTo === currentUserId).map((request) => (
                            <ListItem key={request.requestFrom} onClick={() => onRequestClick(request)} sx={{ cursor: 'pointer', padding: '16px', '&:hover': { backgroundColor: '#f0f0f0' }, transition: 'background-color 0.2s ease', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Avatar sx={{ mr: 2 }}>{request.fromNickname.charAt(0).toUpperCase()}</Avatar>
                                <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{request.fromNickname}</Typography>
                                    <Typography sx={{ color: 'gray', fontSize: '0.8rem' }}>备注: {request.content}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Button variant="outlined" color="primary" onClick={() => handleAgreeRequest(request)}>同意</Button>
                                    <Button variant="outlined" color="secondary" onClick={() => handleDisagreeRequest(request)}>拒绝</Button>
                                </Box>
                            </ListItem>
                        ))}
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="h6" sx={{ fontWeight: 'bold', padding: '16px' }}>我的申请</Typography>
                        {friendRequests.filter(req => req.requestFrom === currentUserId).length === 0 && (
                            <ListItem sx={{ padding: '16px' }}><Typography>暂无我的申请</Typography></ListItem>
                        )}
                        {friendRequests.filter(req => req.requestFrom === currentUserId).map((request) => (
                            <ListItem key={request.requestTo} onClick={() => onRequestClick(request)} sx={{ cursor: 'pointer', padding: '16px', '&:hover': { backgroundColor: '#f0f0f0' }, transition: 'background-color 0.2s ease', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, overflow: 'hidden' }}>
                                    <Typography sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>申请添加</Typography>
                                    <Avatar sx={{ mx: 1 }}>{request.toNickname.charAt(0).toUpperCase()}</Avatar>
                                    <Typography sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>为好友</Typography>
                                </Box>
                                <Typography sx={{ color: request.status === '2' ? 'red' : 'green' }}>{getStatusText(request.status)}</Typography>
                            </ListItem>
                        ))}
                    </>
                )}
            </List>
        </Box>
    );
};

// 聊天页面组件
const ChatPage = ({ navigate,selectedFriend, friendMessages, newMessage, setNewMessage, handleSendMessage, handleKeyPress, showEmojiPicker, setShowEmojiPicker, handleEmojiClick, emojiIconRef, emojiPickerRef, selfAvatar, inputRef, onBack, handleShareCookbookClick, handleReadMessage, handleShowGames }) => {
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
                                <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'row' }}>
                                    <Typography sx={{ fontSize: '0.8rem', color: message.isRead ? 'gray' : 'blue', marginRight: 2, flexDirection:'row' }}>
                                        {message.isRead ? '已读' : '未读'}
                                    </Typography>
                                    {message.messageType === 'cookBook' ? (
                                        renderCookbookCard(JSON.parse(message.text))
                                    ) : message.messageType === 'Gomoku' ? (
                                        <GomokuInviteCard message={JSON.parse(message.text)} friend={selectedFriend} onJoin={(roomId) => navigate(`/gomoku?roomId=${roomId}`)} navigate={navigate} />
                                    ) : (
                                        <Box sx={{ backgroundColor: '#DCF8C6', borderRadius: 3, padding: '8px', maxWidth: '80%', wordBreak: 'break-word', whiteSpace: 'pre-wrap', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)' }}>
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
                                        <GomokuInviteCard message={JSON.parse(message.text)} friend={selectedFriend} onJoin={(roomId) => navigate(`/gomoku?roomId=${roomId}`)} navigate={navigate} />
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

function MessagesPage() {
    const [selectedFriend, setSelectedFriend] = useState(null);
    const [friends, setFriends] = useState([]);
    const [friendMessages, setFriendMessages] = useState({});
    const [newMessage, setNewMessage] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const navigate = useNavigate();
    const [selfNickname, setSelfNickname] = useState('');
    const [selfAvatar, setSelfAvatar] = useState('U');
    const [selectedTab, setSelectedTab] = useState(0);
    const [friendRequests, setFriendRequests] = useState([]);
    const [openAddFriendDialog, setOpenAddFriendDialog] = useState(false);
    const [addFriendUserId, setAddFriendUserId] = useState('');
    const [addFriendContent, setAddFriendContent] = useState('');
    const [openRequestDetail, setOpenRequestDetail] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isInputFocused, setIsInputFocused] = useState(false);
    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
    const [shareOptions, setShareOptions] = useState([]);
    const [openShareDialog, setOpenShareDialog] = useState(false);

    const emojiPickerRef = useRef(null);
    const emojiIconRef = useRef(null);
    const stompClientRef = useRef(null);
    const inputRef = useRef(null);

    const currentUserId = localStorage.getItem('userId');

    const [showGamesDialog, setShowGamesDialog] = useState(false);

    // 新增函数来处理点击摇杆图标事件
    const handleShowGames = () => {
        setShowGamesDialog(true);
    };

    // 新增函数来处理点击五子棋游戏图标事件
    const handleInviteGobang = async () => {
        if (selectedFriend) {
            try {
                const response = await apiRequest('/api/gomoku/invite', 'GET', {
                    userId: currentUserId,
                    friendId: selectedFriend.id
                }, navigate);
                if (response && response.inviteCode) {
                    setShowGamesDialog(false);
                    await handleFriendSelect(selectedFriend);
                }
            } catch (error) {
                console.error('发送游戏邀请请求出错:', error);
            }
        }
    };

    const fetchFriends = async () => {
        if (currentUserId) {
            try {
                const friendIds = await apiRequest('/friend-ship', 'POST', { userId: currentUserId }, navigate);
                if (friendIds) {
                    const updatedFriends = await Promise.all(friendIds.friends.map(async (friendId) => {
                        const friendInfo = await apiRequest('/friend-info', 'GET', { userId: friendId }, navigate);
                        return friendInfo && {
                            id: friendId,
                            name: friendInfo.userNickName,
                            avatar: friendInfo.userNickName.charAt(0).toUpperCase()
                        };
                    }));
                    setFriends(updatedFriends.filter(Boolean));
                }
            } catch (error) {
                console.error('Error fetching friends:', error);
            }
        }
    };

    const fetchSelfInfo = async () => {
        if (currentUserId) {
            try {
                const selfInfo = await apiRequest('/friend-info', 'GET', { userId: currentUserId }, navigate);
                if (selfInfo) {
                    setSelfNickname(selfInfo.userNickName);
                    setSelfAvatar(selfInfo.userNickName.charAt(0).toUpperCase());
                }
            } catch (error) {
                console.error('Error fetching self info:', error);
            }
        }
    };

    const fetchFriendRequests = async () => {
        if (currentUserId) {
            try {
                const requests = await apiRequest('/friend-request-query', 'POST', { userId: currentUserId }, navigate);
                if (requests && requests.code === '200') {
                    const requestsWithNicknames = await Promise.all(
                        requests.friendToBeRequestList.map(async (request) => {
                            const fromInfo = await apiRequest('/friend-info', 'GET', { userId: request.requestFrom }, navigate);
                            const toInfo = await apiRequest('/friend-info', 'GET', { userId: request.requestTo }, navigate);
                            return {
                                ...request,
                                fromNickname: fromInfo ? fromInfo.userNickName : '未知用户',
                                toNickname: toInfo ? toInfo.userNickName : '未知用户'
                            };
                        })
                    );
                    setFriendRequests(requestsWithNicknames);
                }
            } catch (error) {
                console.error('Error fetching friend requests:', error);
            }
        }
    };

    const handleFriendSelect = async (friend) => {
        setSelectedFriend(friend);
        if (friend && currentUserId) {
            try {
                const messages = await apiRequest('/message-query', 'POST', {
                    userIdFrom: currentUserId,
                    userIdTo: friend.id,
                    curPage: 1,
                    pageSize: 20
                }, navigate);
                if (messages) {
                    setFriendMessages((prevMessages) => ({
                        ...prevMessages,
                        [friend.id]: messages.records.map(record => ({
                            text: record.message,
                            sender: record.userIdFrom === currentUserId ? 'user' : 'other',
                            messageType: record.messageType,
                            isRead: record.read
                        }))
                    }));
                }
            } catch (error) {
                console.error('Error fetching messages:', error);
            }
        }
    };

    const handleSendMessage = async () => {
        if (newMessage.trim() === '' || !selectedFriend) return;
        try {
            const response = await apiRequest('/send-message', 'POST', {
                userIdFrom: currentUserId,
                userIdTo: selectedFriend.id,
                messageType: 'text',
                messageContent: newMessage
            }, navigate);
            if (response && response.code === '200') {
                setFriendMessages((prevMessages) => ({
                    ...prevMessages,
                    [selectedFriend.id]: [
                        ...(prevMessages[selectedFriend.id] || []),
                        { text: newMessage, sender: 'user', messageType: 'text', isRead: true }
                    ]
                }));
                setNewMessage('');
                await handleFriendSelect(selectedFriend);
            }
        } catch (error) {
            console.error('发送消息请求出错:', error);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

    const handleEmojiClick = (event, emojiObject) => {
        if (emojiObject && event.emoji) {
            setNewMessage((prevMessage) => prevMessage + event.emoji);
        }
        setShowEmojiPicker(false);
    };

    const handleAddFriend = async () => {
        if (addFriendUserId && currentUserId) {
            try {
                const response = await apiRequest('/friend-request', 'POST', {
                    userId: currentUserId,
                    friendId: addFriendUserId,
                    content: addFriendContent
                }, navigate);
                if (response && response.code === '200') {
                    alert('发送申请成功');
                    setOpenAddFriendDialog(false);
                    setAddFriendUserId('');
                    setAddFriendContent('');
                }
            } catch (error) {
                console.error('发送好友申请请求出错:', error);
            }
        }
    };

    const handleAgreeRequest = async (request) => {
        if (currentUserId) {
            try {
                const response = await apiRequest('/friend-request-agree', 'POST', {
                    userId: currentUserId,
                    friendId: request.requestFrom,
                    content: request.content
                }, navigate);
                if (response && response.code === '200') {
                    setFriendRequests(friendRequests.filter(req => req.requestFrom !== request.requestFrom));
                    setOpenRequestDetail(false);
                    await fetchFriends();
                }
            } catch (error) {
                console.error('同意好友申请请求出错:', error);
            }
        }
    };

    const handleDisagreeRequest = async (request) => {
        if (currentUserId) {
            try {
                const response = await apiRequest('/friend-request-disagree', 'POST', {
                    userId: currentUserId,
                    friendId: request.requestFrom,
                    content: request.content
                }, navigate);
                if (response && response.code === '200') {
                    setFriendRequests(friendRequests.filter(req => req.requestFrom !== request.requestFrom));
                    setOpenRequestDetail(false);
                }
            } catch (error) {
                console.error('拒绝好友申请请求出错:', error);
            }
        }
    };

    const handleRequestClick = (request) => {
        setSelectedRequest(request);
        setOpenRequestDetail(true);
    };

    const handleAddFriendClick = () => {
        setOpenAddFriendDialog(true);
    };

    const getStatusText = (status) => {
        switch (status) {
            case '0':
                return '待处理';
            case '1':
                return '已同意';
            case '2':
                return '已拒绝';
            default:
                return '未知状态';
        }
    };

    const handleShareCookbookClick = async () => {
        try {
            const response = await apiRequest('/query-likes-name', 'GET', null, navigate);
            if (response && response.code === '200') {
                setShareOptions(response.data);
                setOpenShareDialog(true);
            }
        } catch (error) {
            console.error('获取分享选项请求出错:', error);
        }
    };

    const handleTakeDish = async (dishId) => {
        if (dishId && selectedFriend) {
            try {
                const response = await apiRequest('/send-message', 'POST', {
                    userIdFrom: currentUserId,
                    userIdTo: selectedFriend.id,
                    messageType: 'cookBook',
                    messageContent: dishId
                }, navigate);
                if (response && response.code === '200') {
                    setOpenShareDialog(false);
                    await handleFriendSelect(selectedFriend);
                }
            } catch (error) {
                console.error('Error sharing cookbook:', error);
            }
        }
    };

    const handleReadMessage = async () => {
        if (selectedFriend && currentUserId) {
            try {
                const response = await apiRequest('/read-message', 'POST', {
                    userIdFrom: selectedFriend.id,
                    userIdTo: currentUserId
                }, navigate);
                if (response && response.code === '200') {
                    await handleFriendSelect(selectedFriend);
                }
            } catch (error) {
                console.error('标记消息已读请求出错:', error);
            }
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                emojiPickerRef.current &&
                !emojiPickerRef.current.contains(event.target) &&
                emojiIconRef.current &&
                !emojiIconRef.current.contains(event.target)
            ) {
                setShowEmojiPicker(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [emojiPickerRef, emojiIconRef]);

    useEffect(() => {
        const handleKeyboardVisibilityChange = () => {
            setIsKeyboardVisible(window.innerHeight < document.documentElement.clientHeight);
        };
        window.addEventListener('resize', handleKeyboardVisibilityChange);
        return () => {
            window.removeEventListener('resize', handleKeyboardVisibilityChange);
        };
    }, []);

    useEffect(() => {
        if (!isKeyboardVisible && !isInputFocused) {
            setShowEmojiPicker(false);
        }
    }, [isKeyboardVisible, isInputFocused]);

    useEffect(() => {
        fetchFriends();
        fetchSelfInfo();
        fetchFriendRequests();
    }, [currentUserId]);

    useEffect(() => {
        if (currentUserId) {
            stompClientRef.current = new Client({
                brokerURL: `ws://${baseUrl}/chat-websocket?userId=${currentUserId}`,
                connectHeaders: {
                    login: 'guest',
                    passcode: 'guest'
                },
                debug: (str) => console.log(str),
                reconnectDelay: 5000,
                heartbeatIncoming: 4000,
                heartbeatOutgoing: 4000
            });

            stompClientRef.current.onConnect = (frame) => {
                console.log('Connected: ', frame);
                stompClientRef.current.subscribe(`/topic/${currentUserId}`, (message) => {
                    try {
                        const data = JSON.parse(message.body);
                        if (data.type === 'newMessage') {
                            if (selectedFriend && selectedFriend.id === data.senderId) {
                                // 如果当前正在和发送方聊天，调用已读接口
                                handleReadMessage();
                            }
                            if (selectedFriend) {
                                handleFriendSelect(selectedFriend);
                            }
                        } else if (['friendRequest', 'friendRequestAgree', 'friendRequestDisagree'].includes(data.type)) {
                            fetchFriendRequests();
                        } else if (data.type === 'readMessage' && selectedFriend) {
                            handleFriendSelect(selectedFriend);
                        }
                    } catch (parseError) {
                        console.error('Error parsing WebSocket message:', parseError);
                    }
                });
            };

            stompClientRef.current.onStompError = (frame) => {
                console.error('Broker reported error: ' + frame.headers['message']);
                console.error('Additional details: ' + frame.body);
            };

            stompClientRef.current.activate();

            return () => {
                if (stompClientRef.current) {
                    stompClientRef.current.deactivate();
                }
            };
        }
    }, [currentUserId, selectedFriend]);

    return (
        <Box
            sx={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                minHeight: '100vh',
                backgroundColor: '#f9f9f9'
            }}
        >
            {selectedFriend ? (
                <ChatPage
                    navigate={navigate}
                    selectedFriend={selectedFriend}
                    friendMessages={friendMessages}
                    newMessage={newMessage}
                    setNewMessage={setNewMessage}
                    handleSendMessage={handleSendMessage}
                    handleKeyPress={handleKeyPress}
                    showEmojiPicker={showEmojiPicker}
                    setShowEmojiPicker={setShowEmojiPicker}
                    handleEmojiClick={handleEmojiClick}
                    emojiIconRef={emojiIconRef}
                    emojiPickerRef={emojiPickerRef}
                    selfAvatar={selfAvatar}
                    inputRef={inputRef}
                    onBack={() => setSelectedFriend(null)}
                    handleShareCookbookClick={handleShareCookbookClick}
                    handleReadMessage={handleReadMessage}
                    handleShowGames={handleShowGames}
                />
            ) : (
                <ChatListPage
                    friends={friends}
                    onFriendSelect={handleFriendSelect}
                    selectedTab={selectedTab}
                    setSelectedTab={setSelectedTab}
                    friendRequests={friendRequests}
                    onAddFriendClick={handleAddFriendClick}
                    onRequestClick={handleRequestClick}
                    handleAgreeRequest={handleAgreeRequest}
                    handleDisagreeRequest={handleDisagreeRequest}
                    getStatusText={getStatusText}
                />
            )}
            <Dialog
                open={openAddFriendDialog}
                onClose={() => setOpenAddFriendDialog(false)}
                aria-labelledby="add-friend-dialog-title"
                aria-describedby="add-friend-dialog-description"
            >
                <DialogTitle id="add-friend-dialog-title">添加好友</DialogTitle>
                <DialogContent>
                    <DialogContentText id="add-friend-dialog-description">
                        请输入要添加的好友ID和备注信息
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="add-friend-user-id"
                        label="好友ID"
                        type="text"
                        fullWidth
                        value={addFriendUserId}
                        onChange={(e) => setAddFriendUserId(e.target.value)}
                    />
                    <TextField
                        margin="dense"
                        id="add-friend-content"
                        label="备注信息"
                        type="text"
                        fullWidth
                        value={addFriendContent}
                        onChange={(e) => setAddFriendContent(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenAddFriendDialog(false)}>取消</Button>
                    <Button onClick={handleAddFriend}>发送申请</Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={openRequestDetail}
                onClose={() => setOpenRequestDetail(false)}
                aria-labelledby="request-detail-dialog-title"
                aria-describedby="request-detail-dialog-description"
            >
                <DialogTitle id="request-detail-dialog-title">好友申请详情</DialogTitle>
                <DialogContent>
                    <DialogContentText id="request-detail-dialog-description">
                        {selectedRequest && (
                            <>
                                <Typography>申请人: {selectedRequest.fromNickname}</Typography>
                                <Typography>备注信息: {selectedRequest.content}</Typography>
                                <Typography>状态: {getStatusText(selectedRequest.status)}</Typography>
                            </>
                        )}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    {selectedRequest && selectedRequest.status === '0' && (
                        <>
                            <Button onClick={() => handleAgreeRequest(selectedRequest)}>同意</Button>
                            <Button onClick={() => handleDisagreeRequest(selectedRequest)}>拒绝</Button>
                        </>
                    )}
                    <Button onClick={() => setOpenRequestDetail(false)}>关闭</Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={openShareDialog}
                onClose={() => setOpenShareDialog(false)}
                aria-labelledby="share-cookbook-dialog-title"
                aria-describedby="share-cookbook-dialog-description"
            >
                <DialogTitle id="share-cookbook-dialog-title">分享菜谱</DialogTitle>
                <DialogContent>
                    <DialogContentText id="share-cookbook-dialog-description">
                        请选择要分享的菜谱
                    </DialogContentText>
                    <List>
                        {shareOptions.map((option) => (
                            <ListItem key={option.id} button onClick={() => handleTakeDish(option.id)}>
                                <Typography>{option.dishName}</Typography>
                            </ListItem>
                        ))}
                    </List>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenShareDialog(false)}>取消</Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={showGamesDialog}
                onClose={() => setShowGamesDialog(false)}
                aria-labelledby="games-dialog-title"
                aria-describedby="games-dialog-description"
            >
                <DialogTitle id="games-dialog-title">选择游戏</DialogTitle>
                <DialogContent>
                    <DialogContentText id="games-dialog-description">
                        请选择要邀请的游戏
                    </DialogContentText>
                    <List>
                        {/* 五子棋游戏图标 */}
                        <ListItem key="gobang" button onClick={handleInviteGobang}>
                            <Avatar sx={{ mr: 2 }}><FaChessBoard /></Avatar>
                            <Typography>五子棋</Typography>
                        </ListItem>
                    </List>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowGamesDialog(false)}>取消</Button>
                </DialogActions>
            </Dialog>
            <BottomNavigationBar />
        </Box>
    );
}

export default MessagesPage;