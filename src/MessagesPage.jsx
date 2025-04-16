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
    Avatar,
    Divider,
    IconButton
} from '@mui/material';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import { useNavigate } from'react-router-dom';
import BottomNavigationBar from './BottomNavigationBar.jsx';
import Picker from 'emoji-picker-react';
import apiRequest from './api.js';

function MessagesPage() {
    const [selectedFriend, setSelectedFriend] = useState(null);
    const [friends, setFriends] = useState([]);
    const [friendMessages, setFriendMessages] = useState({});
    const [newMessage, setNewMessage] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const navigate = useNavigate();

    const emojiPickerRef = useRef(null);
    const emojiIconRef = useRef(null);

    // 从本地存储获取 userId
    const currentUserId = localStorage.getItem('userId');

    const handleFriendSelect = async (friend) => {
        setSelectedFriend(friend);
        if (friend && currentUserId) {
            try {
                const formData = {
                    userIdFrom: currentUserId,
                    userIdTo: friend.id,
                    // 假设分页参数默认值
                    curPage: 1,
                    pageSize: 20
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

    const handleSendMessage = () => {
        if (newMessage.trim() === '') return;
        if (selectedFriend) {
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

            setTimeout(() => {
                setFriendMessages((prevMessages) => {
                    const currentMessages = prevMessages[selectedFriend.id] || [];
                    return {
                       ...prevMessages,
                        [selectedFriend.id]: [
                       ...currentMessages,
                        { text: '我收到你的消息啦！', sender: 'other' }
                        ]
                    };
                });
            }, 1000);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

    const handleEmojiClick = (event, emojiObject) => {
        console.log('Selected emoji object:', emojiObject); 
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
                        setFriends(response.friends.map(friendId => ({
                            id: friendId,
                            name: `好友${friendId}`,
                            avatar: 'U'
                        })));
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

    return (
        <Box
            sx={{
                minHeight: '100vh',
                p: 4,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #FFE4B5, #FFECD1)',
                color: '#333'
            }}
        >
            <Card
                sx={{
                    p: 4,
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
                    <Typography
                        variant="h4"
                        gutterBottom
                        sx={{
                            background: 'linear-gradient(45deg, #FF6F61, #FFB142)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            textFillColor: 'transparent',
                            textAlign: 'center'
                        }}
                    >
                        消息页面
                    </Typography>
                    <IconButton>
                        <ChatBubbleOutlineIcon />
                    </IconButton>
                </Box>
                <Box
                    sx={{
                        display: 'flex',
                        width: '100%'
                    }}
                >
                    <Box
                        sx={{
                            width: '30%',
                            borderRight: '1px solid #ccc',
                            p: 2
                        }}
                    >
                        <List>
                            {friends.map((friend) => (
                                <ListItem
                                    key={friend.id}
                                    onClick={() => handleFriendSelect(friend)}
                                    sx={{ cursor: 'pointer', py: 2, display: 'flex', width: '100%' }}
                                >
                                    <Avatar sx={{ mr: 1 }}>{friend.avatar}</Avatar>
                                    <Typography>{friend.name}</Typography>
                                </ListItem>
                            ))}
                        </List>
                    </Box>
                    <Box
                        sx={{
                            width: '70%',
                            p: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'flex-start',
                            minHeight: 560
                        }}
                    >
                        {selectedFriend && (
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
                                                <Avatar sx={{ marginLeft: 1 }}>U</Avatar>
                                            ) : (
                                                <Avatar sx={{ marginRight: 1 }}>O</Avatar>
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
                                        position: 'relative',
                                        display: 'flex',
                                        alignItems: 'center',
                                        borderTop: '1px solid #ccc',
                                        pt: 2
                                    }}
                                >
                                    <IconButton
                                        ref={emojiIconRef}
                                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                        sx={{
                                            position: 'absolute',
                                            top: 5,
                                            left: 10,
                                            zIndex: 1,
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
                                                bottom: 190,
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
                                        fullWidth
                                        multiline
                                        rows={3}
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder="输入消息..."
                                        sx={{
                                            ml: 4,
                                            mr: 2,
                                            position:'relative',
                                            pt: 4,
                                            pb: 5,
                                            zIndex: 1
                                        }}
                                        inputProps={{
                                            style: {
                                                paddingTop: '2px',
                                                paddingBottom: '2px'
                                            }
                                        }}
                                    />
                                    <Button
                                        variant="contained"
                                        onClick={handleSendMessage}
                                        sx={{
                                            background: 'linear-gradient(45deg, #FF6F61, #FFB142)',
                                            '&:hover': {
                                                background: 'linear-gradient(45deg, #FFB142, #FF6F61)'
                                            },
                                            position: 'absolute',
                                            bottom: 1,
                                            right: 17,
                                            zIndex: 1
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
            <BottomNavigationBar />
        </Box>
    );
}

export default MessagesPage;    