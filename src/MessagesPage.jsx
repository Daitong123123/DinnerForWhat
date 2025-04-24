import BottomNavigationBar from './BottomNavigationBar.jsx';
import React, { useState, useEffect, useRef } from 'react';
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
import { useNavigate } from 'react-router-dom';
import Picker from 'emoji-picker-react';
import apiRequest from './api.js';
import { Client } from '@stomp/stompjs';
import baseUrl from './config.js';
import { FaUserPlus, FaCamera, FaMicrophone, FaImage } from 'react-icons/fa';
import { IoSend } from 'react-icons/io5';

// 聊天列表页面组件
function ChatListPage({ friends, onFriendSelect, selectedTab, setSelectedTab, friendRequests, onAddFriendClick, onRequestClick, handleAgreeRequest, handleDisagreeRequest, getStatusText }) {
    const currentUserId = localStorage.getItem('userId');
    return (
        <Box
            sx={{
                width: '100%',
                backgroundColor: '#fff',
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px',
                    borderBottom: '1px solid #e0e0e0'
                }}
            >
                <Tabs
                    value={selectedTab}
                    onChange={(e, newValue) => setSelectedTab(newValue)}
                    aria-label="friend tabs"
                    textColor="primary"
                    indicatorColor="primary"
                >
                    <Tab label="我的好友" />
                    <Tab label="好友申请" />
                </Tabs>
                <IconButton onClick={onAddFriendClick}>
                    <FaUserPlus />
                </IconButton>
            </Box>
            <List
                sx={{
                    flexGrow: 1,
                    overflowY: 'auto'
                }}
            >
                {selectedTab === 0 ? (
                    friends.map((friend) => (
                        <ListItem
                            key={friend.id}
                            onClick={() => onFriendSelect(friend)}
                            sx={{
                                cursor: 'pointer',
                                padding: '16px',
                                '&:hover': {
                                    backgroundColor: '#f0f0f0'
                                },
                                transition: 'background-color 0.2s ease'
                            }}
                        >
                            <Avatar sx={{ mr: 2 }}>{friend.avatar}</Avatar>
                            <Typography variant="subtitle1">{friend.name}</Typography>
                        </ListItem>
                    ))
                ) : (
                    <>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', padding: '16px' }}>
                            好友请求
                        </Typography>
                        {friendRequests.filter(req => req.requestTo === currentUserId).length === 0 && (
                            <ListItem sx={{ padding: '16px' }}>
                                <Typography>暂无好友请求</Typography>
                            </ListItem>
                        )}
                        {friendRequests.filter(req => req.requestTo === currentUserId).map((request) => (
                            <ListItem
                                key={request.requestFrom}
                                onClick={() => onRequestClick(request)}
                                sx={{
                                    cursor: 'pointer',
                                    padding: '16px',
                                    '&:hover': {
                                        backgroundColor: '#f0f0f0'
                                    },
                                    transition: 'background-color 0.2s ease',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between'
                                }}
                            >
                                <Avatar sx={{ mr: 2 }}>{request.fromNickname.charAt(0).toUpperCase()}</Avatar>
                                <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                        {request.fromNickname}
                                    </Typography>
                                    <Typography sx={{ color: 'gray', fontSize: '0.8rem' }}>
                                        备注: {request.content}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Button variant="outlined" color="primary" onClick={() => handleAgreeRequest(request)}>
                                        同意
                                    </Button>
                                    <Button variant="outlined" color="secondary" onClick={() => handleDisagreeRequest(request)}>
                                        拒绝
                                    </Button>
                                </Box>
                            </ListItem>
                        ))}
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="h6" sx={{ fontWeight: 'bold', padding: '16px' }}>
                            我的申请
                        </Typography>
                        {friendRequests.filter(req => req.requestFrom === currentUserId).length === 0 && (
                            <ListItem sx={{ padding: '16px' }}>
                                <Typography>暂无我的申请</Typography>
                            </ListItem>
                        )}
                        {friendRequests.filter(req => req.requestFrom === currentUserId).map((request) => (
                            <ListItem
                                key={request.requestTo}
                                onClick={() => onRequestClick(request)}
                                sx={{
                                    cursor: 'pointer',
                                    padding: '16px',
                                    '&:hover': {
                                        backgroundColor: '#f0f0f0'
                                    },
                                    transition: 'background-color 0.2s ease',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between'
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, overflow: 'hidden' }}>
                                    <Typography sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>申请添加</Typography>
                                    <Avatar sx={{ mx: 1 }}>{request.toNickname.charAt(0).toUpperCase()}</Avatar>
                                    <Typography sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>为好友</Typography>
                                </Box>
                                <Typography sx={{ color: request.status === '2' ? 'red' : 'green' }}>
                                    {getStatusText(request.status)}
                                </Typography>
                            </ListItem>
                        ))}
                    </>
                )}
            </List>
        </Box>
    );
}

// 聊天页面组件
function ChatPage({ selectedFriend, friendMessages, newMessage, setNewMessage, handleSendMessage, handleKeyPress, showEmojiPicker, setShowEmojiPicker, handleEmojiClick, emojiIconRef, emojiPickerRef, selfAvatar, inputRef, onBack }) {
    const chatListRef = useRef(null);
    const inputBoxRef = useRef(null);

    useEffect(() => {
        if (chatListRef.current) {
            chatListRef.current.scrollTop = chatListRef.current.scrollHeight;
        }
    }, [friendMessages]);

    return (
        <Box
            sx={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#f9f9f9',
                position: 'relative',
                height: '100vh',
                paddingBottom: '120px'
            }}
        >
            <AppBar position="sticky" sx={{ backgroundColor: '#fff' }}>
                <Toolbar>
                    <IconButton onClick={onBack}>
                        <ArrowBack />
                    </IconButton>
                    <Typography variant="h6" sx={{ 
                        fontWeight: 'bold', 
                        flexGrow: 1, 
                        textAlign: 'center', 
                        whiteSpace: 'nowrap', 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis', 
                        maxWidth: '60%',
                        color: '#333',
                        textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                    }}>
                        {selectedFriend ? `正在和 ${selectedFriend.name} 聊天` : '请选择好友开始聊天'}
                    </Typography>
                </Toolbar>
            </AppBar>
            <List
                ref={chatListRef}
                sx={{
                    flexGrow: 1,
                    overflowY: 'auto',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    marginBottom: '80px'
                }}
            >
                {friendMessages[selectedFriend.id]?.map((message, index) => (
                    <ListItem
                        key={index}
                        alignItems="flex-start"
                        sx={{
                            justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                            mb: 2,
                            flexDirection: 'row'
                        }}
                    >
                        {message.sender === 'user' ? (
                            <>
                                <Box
                                    sx={{
                                        backgroundColor: '#DCF8C6',
                                        borderRadius: 8,
                                        padding: '8px',
                                        maxWidth: '80%',
                                        wordBreak: 'break-word',
                                        whiteSpace: 'pre-wrap',
                                        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                                        marginRight: 2
                                    }}
                                >
                                    {message.text}
                                </Box>
                                <Avatar>{selfAvatar}</Avatar>
                            </>
                        ) : (
                            <>
                                <Avatar sx={{ marginRight: 2 }}>{selectedFriend.avatar}</Avatar>
                                <Box
                                    sx={{
                                        backgroundColor: '#E5E5EA',
                                        borderRadius: 8,
                                        padding: '8px',
                                        maxWidth: '80%',
                                        wordBreak: 'break-word',
                                        whiteSpace: 'pre-wrap',
                                        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
                                    }}
                                >
                                    {message.text}
                                </Box>
                            </>
                        )}
                    </ListItem>
                ))}
            </List>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    zIndex: 1,
                    backgroundColor: '#fff',
                    borderTop: '1px solid #e0e0e0',
                    height: '80px'
                }}
            >
                <Box
                    sx={{
                        padding: '8px 16px',
                        display: 'flex',
                        alignItems: 'center'
                    }}
                >
                    <TextField
                        ref={inputRef}
                        fullWidth
                        multiline
                        rows={1}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="输入消息..."
                        sx={{
                            '& fieldset': {
                                borderWidth: '2px',
                                borderRadius: '10px'
                            },
                            height: 60,
                            padding: '2px',
                            backgroundColor: '#f5f5f5'
                        }}
                        inputProps={{
                            style: {
                                paddingTop: '0px',
                                paddingBottom: '0px',
                                fontSize: '18px'
                            }
                        }}
                    />
                    <Button
                        variant="contained"
                        onClick={handleSendMessage}
                        sx={{
                            background: '#0084ff',
                            '&:hover': {
                                background: '#0066cc'
                            },
                            marginLeft: 1,
                            height: 40,
                            width: 40,
                            borderRadius: 50
                        }}
                    >
                        <IoSend />
                    </Button>
                </Box>
                <Box
                    sx={{
                        padding: '8px 16px',
                        display: 'flex',
                        justifyContent: 'space-around',
                        borderTop: '1px solid #f0f0f0'
                    }}
                >
                    <IconButton
                        ref={emojiIconRef}
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        sx={{
                            width: 40,
                            height: 40,
                            color: 'inherit'
                        }}
                    >
                        <span style={{ fontSize: '20px' }}>😊</span>
                    </IconButton>
                    <IconButton sx={{ width: 40, height: 40, color: '#0084ff' }}>
                        <FaImage size={24} />
                    </IconButton>
                    <IconButton sx={{ width: 40, height: 40, color: '#0084ff' }}>
                        <FaCamera size={24} />
                    </IconButton>
                    <IconButton sx={{ width: 40, height: 40, color: '#666' }}>
                        <FaMicrophone size={20} />
                    </IconButton>
                </Box>
                {showEmojiPicker && (
                    <Slide
                        direction="up"
                        in={showEmojiPicker}
                        mountOnEnter
                        unmountOnExit
                        style={{ position: 'absolute', bottom: 120, left: 16, zIndex: 2 }}
                    >
                        <Box
                            ref={emojiPickerRef}
                            sx={{
                                backgroundColor: '#fff',
                                boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
                                borderRadius: 8,
                                padding: '8px'
                            }}
                        >
                            <Picker
                                onEmojiClick={handleEmojiClick}
                            />
                        </Box>
                    </Slide>
                )}
            </Box>
        </Box>
    );
}

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

    const emojiPickerRef = useRef(null);
    const emojiIconRef = useRef(null);
    const stompClientRef = useRef(null);
    const inputRef = useRef(null);

    const currentUserId = localStorage.getItem('userId');

    const handleFriendSelect = async (friend) => {
        setSelectedFriend(friend);
        if (friend && currentUserId) {
            try {
                const formData = {
                    userIdFrom: currentUserId,
                    userIdTo: friend.id,
                };
                const response = await apiRequest('/message-query', 'POST', formData, navigate);
                if (response) {
                    const messages = response.records.map(record => ({
                        text: record.message,
                        sender: record.userIdFrom === currentUserId ? 'user' : 'other'
                    }));
                    setFriendMessages((prevMessages) => ({
                        ...prevMessages,
                        [friend.id]: messages
                    }));
                } else {
                    console.error('获取聊天记录失败');
                }
            } catch (error) {
                console.error('Error fetching messages:', error);
            }
        }
    };

    const handleSendMessage = async () => {
        if (newMessage.trim() === '') return;
        if (selectedFriend) {
            try {
                const sendMessageRequest = {
                    userIdFrom: currentUserId,
                    userIdTo: selectedFriend.id,
                    messageType: 'text',
                    messageContent: newMessage
                };

                const response = await apiRequest('/send-message', 'POST', sendMessageRequest, navigate);
                if (response && response.code === '200') {
                    setFriendMessages((prevMessages) => {
                        const currentMessages = prevMessages[selectedFriend.id] || [];
                        return {
                            ...prevMessages,
                            [selectedFriend.id]: [
                                ...currentMessages,
                                { text: newMessage, sender: 'user' }
                            ]
                        };
                    });
                    setNewMessage('');

                    const formData = {
                        userIdFrom: currentUserId,
                        userIdTo: selectedFriend.id,
                        curPage: 1,
                        pageSize: 20
                    };
                    const newResponse = await apiRequest('/message-query', 'POST', formData, navigate);
                    if (newResponse) {
                        const messages = newResponse.records.map(record => ({
                            text: record.message,
                            sender: record.userIdFrom === currentUserId ? 'user' : 'other'
                        }));
                        setFriendMessages((prevMessages) => ({
                            ...prevMessages,
                            [selectedFriend.id]: messages
                        }));
                    } else {
                        console.error('重新获取聊天记录失败');
                    }
                } else {
                    console.error('发送消息失败:', response ? response.message : '无响应信息');
                }
            } catch (error) {
                console.error('发送消息请求出错:', error);
            }
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

    const handleEmojiClick = (event, emojiObject) => {
        if (emojiObject && emojiObject.emoji) {
            setNewMessage((prevMessage) => prevMessage + emojiObject.emoji);
        }
        setShowEmojiPicker(false);
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
        if (isKeyboardVisible === false && isInputFocused === false) {
            setShowEmojiPicker(false);
        }
    }, [isKeyboardVisible, isInputFocused]);

    useEffect(() => {
        const fetchFriends = async () => {
            if (currentUserId) {
                try {
                    const formData = {
                        userId: currentUserId
                    };
                    const response = await apiRequest('/friend-ship', 'POST', formData, navigate);
                    if (response) {
                        const friendIds = response.friends;
                        const updatedFriends = [];
                        for (const friendId of friendIds) {
                            const friendInfoFormData = {
                                userId: friendId
                            };
                            const friendInfoResponse = await apiRequest('/friend-info', 'GET', friendInfoFormData, navigate);
                            if (friendInfoResponse) {
                                const firstChar = friendInfoResponse.userNickName.charAt(0).toUpperCase();
                                updatedFriends.push({
                                    id: friendId,
                                    name: friendInfoResponse.userNickName,
                                    avatar: firstChar
                                });
                            }
                        }
                        if (updatedFriends.length > 0) {
                            setFriends(updatedFriends);
                        } else {
                            console.warn('没有获取到有效的好友信息，好友列表为空');
                        }
                    } else {
                        console.error('获取好友列表失败');
                    }
                } catch (error) {
                    console.error('Error fetching friends:', error);
                }
            }
        };
        fetchFriends();
    }, [currentUserId]);

    useEffect(() => {
        const fetchSelfInfo = async () => {
            if (currentUserId) {
                try {
                    const formData = {
                        userId: currentUserId
                    };
                    const response = await apiRequest('/friend-info', 'GET', formData, navigate);
                    if (response) {
                        setSelfNickname(response.userNickName);
                        const firstChar = response.userNickName.charAt(0).toUpperCase();
                        setSelfAvatar(firstChar);
                    } else {
                        console.error('获取自己的信息失败');
                    }
                } catch (error) {
                    console.error('Error fetching self info:', error);
                }
            }
        };
        fetchSelfInfo();
    }, [currentUserId]);

    useEffect(() => {
        const fetchFriendRequests = async () => {
            if (currentUserId) {
                try {
                    const formData = {
                        userId: currentUserId
                    };
                    const response = await apiRequest('/friend-request-query', 'POST', formData, navigate);
                    if (response && response.code === '200') {
                        const requestsWithNicknames = await Promise.all(
                            response.friendToBeRequestList.map(async (request) => {
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
                    } else {
                        console.error('获取好友申请列表失败');
                    }
                } catch (error) {
                    console.error('Error fetching friend requests:', error);
                }
            }
        };
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
                debug: function (str) {
                    console.log(str);
                },
                reconnectDelay: 5000,
                heartbeatIncoming: 4000,
                heartbeatOutgoing: 4000
            });

            stompClientRef.current.onConnect = (frame) => {
                console.log('Connected: ', frame);
                stompClientRef.current.subscribe(`/topic/${currentUserId}`, (message) => {
                    try {
                        let data;
                        try {
                            data = JSON.parse(message.body);
                        } catch (jsonError) {
                            data = { type: 'newMessage', content: message.body };
                        }
                        if (data.type === 'newMessage' && selectedFriend) {
                            const formData = {
                                userIdFrom: currentUserId,
                                userIdTo: selectedFriend.id,
                                curPage: 1,
                                pageSize: 20
                            };
                            apiRequest('/message-query', 'POST', formData, navigate)
                                .then((response) => {
                                    if (response) {
                                        const messages = response.records.map((record) => ({
                                            text: record.message,
                                            sender: record.userIdFrom === currentUserId ? 'user' : 'other'
                                        }));
                                        setFriendMessages((prevMessages) => ({
                                            ...prevMessages,
                                            [selectedFriend.id]: messages
                                        }));
                                    } else {
                                        console.error('重新获取聊天记录失败');
                                    }
                                })
                                .catch((error) => {
                                    console.error('Error fetching messages:', error);
                                });
                        } else if (['friendRequest', 'friendRequestAgree', 'friendRequestDisagree'].includes(data.type)) {
                            const formData = {
                                userId: currentUserId
                            };
                            apiRequest('/friend-request-query', 'POST', formData, navigate)
                                .then(async (response) => {
                                    if (response && response.code === '200') {
                                        const requestsWithNicknames = await Promise.all(
                                            response.friendToBeRequestList.map(async (request) => {
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
                                    } else {
                                        console.error('获取好友申请列表失败');
                                    }
                                })
                                .catch((error) => {
                                    console.error('Error fetching friend requests:', error);
                                });
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

    const handleAddFriend = async () => {
        if (addFriendUserId && currentUserId) {
            try {
                const formData = {
                    userId: currentUserId,
                    friendId: addFriendUserId,
                    content: addFriendContent
                };
                const response = await apiRequest('/friend-request', 'POST', formData, navigate);
                if (response && response.code === '200') {
                    alert('发送申请成功');
                    setOpenAddFriendDialog(false);
                    setAddFriendUserId('');
                    setAddFriendContent('');
                } else {
                    console.error('发送好友申请失败:', response ? response.message : '无响应信息');
                }
            } catch (error) {
                console.error('发送好友申请请求出错:', error);
            }
        }
    };

    const handleAgreeRequest = async (request) => {
        if (currentUserId) {
            try {
                const formData = {
                    userId: currentUserId,
                    friendId: request.requestFrom,
                    content: request.content
                };
                const response = await apiRequest('/friend-request-agree', 'POST', formData, navigate);
                if (response && response.code === '200') {
                    const newRequests = friendRequests.filter(req => req.requestFrom !== request.requestFrom);
                    setFriendRequests(newRequests);
                    setOpenRequestDetail(false);
                } else {
                    console.error('同意好友申请失败:', response ? response.message : '无响应信息');
                }
            } catch (error) {
                console.error('同意好友申请请求出错:', error);
            }
        }
    };

    const handleDisagreeRequest = async (request) => {
        if (currentUserId) {
            try {
                const formData = {
                    userId: currentUserId,
                    friendId: request.requestFrom,
                    content: request.content
                };
                const response = await apiRequest('/friend-request-disagree', 'POST', formData, navigate);
                if (response && response.code === '200') {
                    const newRequests = friendRequests.filter(req => req.requestFrom !== request.requestFrom);
                    setFriendRequests(newRequests);
                    setOpenRequestDetail(false);
                } else {
                    console.error('拒绝好友申请失败:', response ? response.message : '无响应信息');
                }
            } catch (error) {
                console.error('拒绝好友申请请求出错:', error);
            }
        }
    };

    const handleTabChange = (event, newValue) => {
        setSelectedTab(newValue);
    };

    const handleRequestClick = (request) => {
        setSelectedRequest(request);
        setOpenRequestDetail(true);
    };

    const getStatusText = (status) => {
        if (status === '2') {
            return '对方已拒绝';
        } else if (status === '1') {
            return '对方已同意';
        }
        return '等待对方回应';
    };

    const handleBack = () => {
        setSelectedFriend(null);
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#f5f5f5',
                fontFamily: 'Inter, sans-serif'
            }}
        >
            <Card
                sx={{
                    flexGrow: 1,
                    boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
                    borderRadius: '8px',
                    margin: '16px',
                    overflow: 'hidden'
                }}
            >
                {selectedFriend ? (
                    <ChatPage
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
                        onBack={handleBack}
                    />
                ) : (
                    <ChatListPage
                        friends={friends}
                        onFriendSelect={handleFriendSelect}
                        selectedTab={selectedTab}
                        setSelectedTab={setSelectedTab}
                        friendRequests={friendRequests}
                        onAddFriendClick={() => setOpenAddFriendDialog(true)}
                        onRequestClick={handleRequestClick}
                        handleAgreeRequest={handleAgreeRequest}
                        handleDisagreeRequest={handleDisagreeRequest}
                        getStatusText={getStatusText}
                    />
                )}
            </Card>
            <Dialog
                open={openAddFriendDialog}
                onClose={() => setOpenAddFriendDialog(false)}
                aria-labelledby="form-dialog-title"
            >
                <DialogTitle id="form-dialog-title">添加好友</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        请输入对方的用户ID和备注信息
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="add-friend-user-id"
                        label="用户ID"
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
                    <Button onClick={() => setOpenAddFriendDialog(false)} color="primary">
                        取消
                    </Button>
                    <Button onClick={handleAddFriend} color="primary">
                        发送申请
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={openRequestDetail}
                onClose={() => setOpenRequestDetail(false)}
                aria-labelledby="request-detail-dialog-title"
            >
                <DialogTitle id="request-detail-dialog-title">好友申请详情</DialogTitle>
                <DialogContent>
                    {selectedRequest && (
                        <>
                            <Typography variant="subtitle1">申请人: {selectedRequest.fromNickname}</Typography>
                            <Typography variant="subtitle1">备注信息: {selectedRequest.content}</Typography>
                            <Typography variant="subtitle1">状态: {getStatusText(selectedRequest.status)}</Typography>
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenRequestDetail(false)} color="primary">
                        关闭
                    </Button>
                </DialogActions>
            </Dialog>
            {!selectedFriend && <BottomNavigationBar />}
        </Box>
    );
}

export default MessagesPage;
