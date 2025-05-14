import BottomNavigationBar from './BottomNavigationBar.jsx';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatListPage from './ChatListPage.jsx';
import ChatPage from './ChatPage.jsx';
import {Avatar,TextField, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Typography, List, ListItem } from '@mui/material';
import apiRequest from './api.js';
import { FaChessBoard} from 'react-icons/fa';
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
                            userIdTo: record.userIdTo,
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
        <div
            style={{
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
                    setFriendMessages={setFriendMessages}
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
                            <ListItem key={option.dishId} button onClick={() => handleTakeDish(option.dishId)}>
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
        </div>
    );
}

export default MessagesPage;    