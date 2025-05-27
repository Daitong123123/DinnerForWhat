import React from 'react';
import {
    Box,
    Typography,
    List,
    ListItem,
    Avatar,
    Divider,
    IconButton,
    Tabs,
    Button,
    Tab
} from '@mui/material';
import { FaUserPlus } from 'react-icons/fa';
import DynamicAvatar from './commons/DynamicAvatar';

// 恋爱记风格配色
const COLORS = {
    primary: '#FF5E87',
    secondary: '#FFB6C1',
    accent: '#FF85A2',
    light: '#FFF0F3',
    dark: '#333333'
};

// 聊天列表页面组件
const ChatListPage = ({ friends, onFriendSelect, selectedTab, setSelectedTab, friendRequests, onAddFriendClick, onRequestClick, handleAgreeRequest, handleDisagreeRequest, getStatusText }) => {
    const currentUserId = localStorage.getItem('userId');
    return (
        <Box sx={{ width: '100%', backgroundColor: COLORS.light, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderBottom: `1px solid ${COLORS.secondary}`, backgroundColor: '#fff' }}>
                <Tabs value={selectedTab} onChange={(e, newValue) => setSelectedTab(newValue)} aria-label="friend tabs"
                    textColor={COLORS.primary}
                    indicatorColor={COLORS.primary}
                    sx={{
                        '& .MuiTabs-indicator': {
                            height: '3px',
                        },
                        '& .MuiTab-root': {
                            minWidth: '60px',
                            textTransform: 'none',
                            fontWeight: 'bold',
                            fontSize: '1rem',
                        }
                    }}
                >
                    <Tab label="我的好友" />
                    <Tab label="好友申请" />
                </Tabs>
                <IconButton onClick={onAddFriendClick} color="primary" sx={{ color: COLORS.primary }}><FaUserPlus /></IconButton>
            </Box>
            <List sx={{ flexGrow: 1, 
                overflowY: 'auto', 
                backgroundColor: COLORS.light,
                padding: '4px 8px'
                }}>
                {selectedTab === 0 ? (
                    friends.map((friend) => (
                        <ListItem key={friend.id} onClick={() => onFriendSelect(friend)}
                            sx={{
                                cursor: 'pointer',
                                padding: '10px',
                                '&:hover': { backgroundColor: '#fff' },
                                transition: 'background-color 0.2s ease',
                                '&:hover .MuiAvatar-root': {
                                    transform: 'scale(1.05)',
                                },
                                backgroundColor: '#fff',
                                borderRadius: '10px',
                                margin: '8px 0px',
                                boxShadow: '0 2px 8px rgba(255, 94, 135, 0.05)'
                            }}
                        >
                            <DynamicAvatar userId={friend.id} size='lg' sx={{ mr: 2}}></DynamicAvatar>
                            <Typography variant="subtitle1" sx={{ fontWeight: '500', color: COLORS.dark }}>{friend.name}</Typography>
                        </ListItem>
                    ))
                ) : (
                    <>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', padding: '16px 16px 8px 16px', color: COLORS.dark }}>好友请求</Typography>
                        {friendRequests.filter(req => req.requestTo === currentUserId).length === 0 && (
                            <ListItem sx={{ padding: '16px', backgroundColor: '#fff', borderRadius: '12px', margin: '8px 0px' }}><Typography sx={{ color: '#666', textAlign: 'center' }}>暂无好友请求</Typography></ListItem>
                        )}
                        {friendRequests.filter(req => req.requestTo === currentUserId).map((request) => (
                            <ListItem key={request.requestFrom} onClick={() => onRequestClick(request)}
                                sx={{
                                    cursor: 'pointer',
                                    padding: '16px',
                                    '&:hover': { backgroundColor: '#fff' },
                                    transition: 'background-color 0.2s ease',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    backgroundColor: '#fff',
                                    borderRadius: '12px',
                                    margin: '8px 0px',
                                    boxShadow: '0 2px 8px rgba(255, 94, 135, 0.05)'
                                }}
                            >
                                <Avatar sx={{ mr: 2, width: 40, height: 40, boxShadow: '0 2px 4px rgba(255, 94, 135, 0.15)', backgroundColor: COLORS.primary, color: 'white' }}>{request.fromNickname.charAt(0).toUpperCase()}</Avatar>
                                <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: COLORS.dark }}>{request.fromNickname}</Typography>
                                    <Typography sx={{ color: '#666', fontSize: '0.8rem' }}>备注: {request.content}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Button variant="contained" color="primary" onClick={() => handleAgreeRequest(request)}
                                        sx={{
                                            backgroundColor: COLORS.primary,
                                            color: 'white',
                                            borderRadius: '20px',
                                            textTransform: 'none',
                                            '&:hover': {
                                                backgroundColor: '#FF4778',
                                            },
                                            boxShadow: '0 2px 4px rgba(255, 94, 135, 0.2)'
                                        }}
                                    >
                                        同意
                                    </Button>
                                    <Button variant="outlined" color="secondary" onClick={() => handleDisagreeRequest(request)}
                                        sx={{
                                            color: COLORS.primary,
                                            borderColor: COLORS.primary,
                                            borderRadius: '20px',
                                            textTransform: 'none',
                                            '&:hover': {
                                                backgroundColor: COLORS.light,
                                            }
                                        }}
                                    >
                                        拒绝
                                    </Button>
                                </Box>
                            </ListItem>
                        ))}
                        <Divider sx={{ my: 2, backgroundColor: COLORS.secondary, margin: '0 16px' }} />
                        <Typography variant="h6" sx={{ fontWeight: 'bold', padding: '16px 16px 8px 16px', color: COLORS.dark}}>我的申请</Typography>
                        {friendRequests.filter(req => req.requestFrom === currentUserId).length === 0 && (
                            <ListItem sx={{ padding: '16px', backgroundColor: '#fff', borderRadius: '12px', margin: '8px 0px' }}><Typography sx={{ color: '#666', textAlign: 'center' }}>暂无我的申请</Typography></ListItem>
                        )}
                        {friendRequests.filter(req => req.requestFrom === currentUserId).map((request) => (
                            <ListItem key={request.requestTo} onClick={() => onRequestClick(request)}
                                sx={{
                                    cursor: 'pointer',
                                    padding: '16px',
                                    '&:hover': { backgroundColor: '#fff' },
                                    transition: 'background-color 0.2s ease',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    backgroundColor: '#fff',
                                    borderRadius: '12px',
                                    margin: '8px 0px',
                                    boxShadow: '0 2px 8px rgba(255, 94, 135, 0.05)'
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, overflow: 'hidden' }}>
                                    <Typography sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#666' }}>申请添加</Typography>
                                    <Avatar sx={{ mx: 1, width: 36, height: 36, boxShadow: '0 2px 4px rgba(255, 94, 135, 0.15)', backgroundColor: COLORS.primary, color: 'white' }}>{request.toNickname.charAt(0).toUpperCase()}</Avatar>
                                    <Typography sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#666' }}>为好友</Typography>
                                </Box>
                                <Typography sx={{ color: request.status === '2' ? COLORS.primary : '#4CAF50' }}>{getStatusText(request.status)}</Typography>
                            </ListItem>
                        ))}
                    </>
                )}
            </List>
        </Box>
    );
};

export default ChatListPage;    