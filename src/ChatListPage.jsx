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

export default ChatListPage;    