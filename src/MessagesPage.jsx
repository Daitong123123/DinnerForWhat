import BottomNavigationBar from './BottomNavigationBar.jsx';
import React, { useState, useEffect, useRef } from'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    TextField,
    Button,
    List,
    ListItem,
    ListItemText,
    Avatar,
    Divider,
    IconButton,
    Tabs,
    Tab,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle
} from '@mui/material';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import { useNavigate } from'react-router-dom';
import Picker from 'emoji-picker-react';
import apiRequest from './api.js';
import { Client } from '@stomp/stompjs';
import baseUrl from './config.js';

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

    const emojiPickerRef = useRef(null);
    const emojiIconRef = useRef(null);
    const stompClientRef = useRef(null);
    const chatListRef = useRef(null);
    const inputRef = useRef(null);

    const currentUserId = localStorage.getItem('userId');

    const handleFriendSelect = async (friend) => {
        setSelectedFriend(friend);
        if (friend && currentUserId) {
            try {
                const formData = {
                    userIdFrom: currentUserId,
                    userIdTo: friend.id,
                    // curPage: 1,
                    // pageSize: 20
                };
                const response = await apiRequest('/message-query', 'POST', formData, navigate);
                if (response) {
                    const messages = response.records.map(record => ({
                        text: record.message,
                        sender: record.userIdFrom === currentUserId? 'user' : 'other'
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
                            sender: record.userIdFrom === currentUserId? 'user' : 'other'
                        }));
                        setFriendMessages((prevMessages) => ({
                           ...prevMessages,
                            [selectedFriend.id]: messages
                        }));
                    } else {
                        console.error('重新获取聊天记录失败');
                    }
                } else {
                    console.error('发送消息失败:', response? response.message : '无响应信息');
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
                                    fromNickname: fromInfo? fromInfo.userNickName : '未知用户',
                                    toNickname: toInfo? toInfo.userNickName : '未知用户'
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
                                            sender: record.userIdFrom === currentUserId? 'user' : 'other'
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
                                                    fromNickname: fromInfo? fromInfo.userNickName : '未知用户',
                                                    toNickname: toInfo? toInfo.userNickName : '未知用户'
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

    useEffect(() => {
        if (chatListRef.current) {
            chatListRef.current.scrollTop = chatListRef.current.scrollHeight;
        }
    }, [friendMessages]);

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
                    console.error('发送好友申请失败:', response? response.message : '无响应信息');
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
                    const newRequests = friendRequests.filter(req => req.requestFrom!== request.requestFrom);
                    setFriendRequests(newRequests);
                    setOpenRequestDetail(false);
                } else {
                    console.error('同意好友申请失败:', response? response.message : '无响应信息');
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
                    const newRequests = friendRequests.filter(req => req.requestFrom!== request.requestFrom);
                    setFriendRequests(newRequests);
                    setOpenRequestDetail(false);
                } else {
                    console.error('拒绝好友申请失败:', response? response.message : '无响应信息');
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

    return (
        <Box
            sx={{
                minHeight: '100vh',
                p: { xs: 1, sm: 4 },
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#f9f9f9',
                color: '#333'
            }}
        >
            <Card
                sx={{
                    p: { xs: 2, sm: 4 },
                    width: '100%',
                    maxWidth: 800,
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                    background: '#fff',
                    borderRadius: 8,
                    border: '1px solid #ccc'
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        mb: 4
                    }}
                >
                    <Tabs
                        value={selectedTab}
                        onChange={handleTabChange}
                        aria-label="friend tabs"
                    >
                        <Tab label="我的好友" />
                        <Tab label="好友申请" />
                    </Tabs>
                    <IconButton onClick={() => setOpenAddFriendDialog(true)}>
                        +
                    </IconButton>
                </Box>
                <Box
                    sx={{
                        display: { xs: 'block', sm: 'flex' },
                        width: '100%'
                    }}
                >
                    <Box
                        sx={{
                            width: { xs: '100%', sm: '30%' },
                            borderRight: { xs: 'none', sm: '1px solid #ccc' },
                            p: 2
                        }}
                    >
                        <List>
                            {selectedTab === 0? (
                                friends.map((friend) => (
                                    <ListItem
                                        key={friend.id}
                                        onClick={() => handleFriendSelect(friend)}
                                        sx={{ cursor: 'pointer', py: 2, display: 'flex', width: '100%' }}
                                    >
                                        <Avatar sx={{ mr: 1 }}>{friend.avatar}</Avatar>
                                        <Typography>{friend.name}</Typography>
                                    </ListItem>
                                ))
                            ) : (
                                <>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                                        好友请求
                                    </Typography>
                                    {friendRequests.filter(req => req.requestTo === currentUserId).length === 0 && (
                                        <ListItem sx={{ py: 2, display: 'flex', width: '100%' }}>
                                            <Typography>暂无好友请求</Typography>
                                        </ListItem>
                                    )}
                                    {friendRequests.filter(req => req.requestTo === currentUserId).map((request) => (
                                        <ListItem
                                            key={request.requestFrom}
                                            onClick={() => handleRequestClick(request)}
                                            sx={{ 
                                                cursor: 'pointer', 
                                                py: 2, 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                justifyContent: 'space-between',
                                                width: '100%' 
                                            }}
                                        >
                                            <Avatar sx={{ mr: 2 }}>{request.fromNickname.charAt(0).toUpperCase()}</Avatar>
                                            <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {request.fromNickname}
                                                </Typography>
                                                <Typography
                                                    sx={{
                                                        color: 'gray',
                                                        fontSize: '0.8rem',
                                                        whiteSpace: 'nowrap', 
                                                        overflow: 'hidden', 
                                                        textOverflow: 'ellipsis'
                                                    }}
                                                >
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
                                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                                        我的申请
                                    </Typography>
                                    {friendRequests.filter(req => req.requestFrom === currentUserId).length === 0 && (
                                        <ListItem sx={{ py: 2, display: 'flex', width: '100%' }}>
                                            <Typography>暂无我的申请</Typography>
                                        </ListItem>
                                    )}
                                    {friendRequests.filter(req => req.requestFrom === currentUserId).map((request) => (
                                        <ListItem
                                            key={request.requestTo}
                                            onClick={() => handleRequestClick(request)}
                                            sx={{ 
                                                cursor: 'pointer', 
                                                py: 2, 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                justifyContent: 'space-between',
                                                width: '100%' 
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, overflow: 'hidden' }}>
                                                <Typography sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>申请添加</Typography>
                                                <Avatar sx={{ mx: 1 }}>{request.toNickname.charAt(0).toUpperCase()}</Avatar>
                                                <Typography sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>为好友</Typography>
                                            </Box>
                                            <Typography sx={{ color: request.status === '2'? 'red' : 'green' }}>
                                                {getStatusText(request.status)}
                                            </Typography>
                                        </ListItem>
                                    ))}
                                </>
                            )}
                        </List>
                    </Box>
                    <Box
                        sx={{
                            width: { xs: '100%', sm: '70%' },
                            p: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'flex-start',
                            minHeight: 560
                        }}
                    >
                        {selectedTab === 0 && selectedFriend && (
                            <>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        mb: 2,
                                        borderBottom: '1px solid #ccc',
                                        pb: 2
                                    }}
                                >
                                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                        与 {selectedFriend.name} 的聊天
                                    </Typography>
                                </Box>
                                <List
                                    ref={chatListRef}
                                    sx={{
                                        maxHeight: 400,
                                        height: 400,
                                        overflowY: 'auto',
                                        mb: 2,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        width: '100%'
                                    }}
                                >
                                    {friendMessages[selectedFriend.id]?.map((message, index) => (
                                        <ListItem
                                            key={index}
                                            alignItems="flex-start"
                                            sx={{
                                                justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                                                mb: 1,
                                                flexDirection: message.sender === 'user' ? 'row-reverse' : 'row',
                                                display: 'flex',
                                                width: '100%',
                                                minWidth: 0
                                            }}
                                        >
                                            {message.sender === 'user' ? (
                                                <Avatar sx={{ marginLeft: 1 }}>{selfAvatar}</Avatar>
                                            ) : (
                                                <Avatar sx={{ marginRight: 1 }}>{selectedFriend.avatar}</Avatar>
                                            )}
                                            <Box
                                                sx={{
                                                    backgroundColor: message.sender === 'user' ? '#DCF8C6' : '#E5E5EA',
                                                    borderRadius: 8,
                                                    padding: '8px',
                                                    mt: 1,
                                                    maxWidth: '80%',
                                                    wordBreak: 'break-word',
                                                    whiteSpace: 'pre-wrap',
                                                    marginLeft: message.sender === 'user' ? 'auto' : 0,
                                                    marginRight: message.sender === 'user' ? 0 : 'auto',
                                                    boxSizing: 'border-box'
                                                }}
                                            >
                                                {message.text}
                                            </Box>
                                        </ListItem>
                                    ))}
                                </List>
                                <Box
                                    sx={{
                                        position: 'sticky',
                                        bottom: 0,
                                        left: 0,
                                        right: 0,
                                        backgroundColor: '#fff',
                                        borderTop: '1px solid #ccc',
                                        padding: '5px 10px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        pointerEvents: 'auto',
                                        userSelect: 'none',
                                        touchAction: 'none'
                                    }}
                                >
                                    <IconButton
                                        ref={emojiIconRef}
                                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                        sx={{
                                            width: 40,
                                            height: 40
                                        }}
                                    >
                                        😊
                                    </IconButton>
                                    {showEmojiPicker && (
                                        <Box
                                            ref={emojiPickerRef}
                                            sx={{
                                                position: 'absolute',
                                                bottom: 50,
                                                left: 15,
                                                zIndex: 1
                                            }}
                                        >
                                            <Picker
                                                onEmojiClick={handleEmojiClick}
                                            />
                                        </Box>
                                    )}
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
                                            ml: 1,
                                            mr: 1,
                                            '& fieldset': {
                                                borderWidth: '1px',
                                                borderRadius: '4px'
                                            }
                                        }}
                                        inputProps={{
                                            style: {
                                                paddingTop: '2px',
                                                paddingBottom: '2px',
                                                fontSize: '14px'
                                            }
                                        }}
                                        onFocus={() => setIsInputFocused(true)}
                                        onBlur={() => setIsInputFocused(false)}
                                    />
                                    <Button
                                        variant="contained"
                                        onClick={handleSendMessage}
                                        sx={{
                                            background: 'linear-gradient(45deg, #FF6F61, #FFB142)',
                                            '&:hover': {
                                                background: 'linear-gradient(45deg, #FFB142, #FF6F61)'
                                            },
                                            marginLeft: 1
                                        }}
                                    >
                                        发送
                                    </Button>
                                </Box>
                            </>
                        )}
                    </Box>
                </Box>
            </Card>
            <Dialog
                open={openAddFriendDialog}
                onClose={() => setOpenAddFriendDialog(false)}
                aria-labelledby="form-dialog-title"
            >
                <DialogTitle id="form-dialog-title">添加好友</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        请输入对方的用户 ID 和申请备注
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="userId"
                        label="用户 ID"
                        type="text"
                        fullWidth
                        value={addFriendUserId}
                        onChange={(e) => setAddFriendUserId(e.target.value)}
                    />
                    <TextField
                        margin="dense"
                        id="content"
                        label="申请备注"
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
                aria-labelledby="request-detail-title"
            >
                <DialogTitle id="request-detail-title">好友申请详情</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        申请人: {selectedRequest?.fromNickname}
                    </DialogContentText>
                    <DialogContentText>
                        申请备注: {selectedRequest?.content}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    {selectedRequest?.requestTo === currentUserId && (
                        <>
                            <Button onClick={() => handleAgreeRequest(selectedRequest)} color="primary">
                                同意
                            </Button>
                            <Button onClick={() => handleDisagreeRequest(selectedRequest)} color="primary">
                                拒绝
                            </Button>
                        </>
                    )}
                    <Button onClick={() => setOpenRequestDetail(false)} color="primary">
                        关闭
                    </Button>
                </DialogActions>
            </Dialog>
            {!isInputFocused && <BottomNavigationBar />}
        </Box>
    );
}

export default MessagesPage;    