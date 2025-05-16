import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Button,
    Avatar,
    TextField,
    Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import baseUrl from './config.js';
import apiRequest from './api.js';
import BottomNavigationBar from './BottomNavigationBar.jsx';
import Layout from './Layout.jsx';

function UserInfoPage() {
    const navigate = useNavigate();
    const [userId, setUserId] = useState('');
    const [userName, setUserName] = useState('');
    const [userAvatar, setUserAvatar] = useState('U');
    const [editing, setEditing] = useState(false);
    const [editedUserName, setEditedUserName] = useState('');
    const [hasLover, setHasLover] = useState(false);
    const [loverInfo, setLoverInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        document.title = '今天吃什么';
        const storedUserId = localStorage.getItem('userId');
        if (storedUserId) {
            setUserId(storedUserId);
            fetchUserInfo(storedUserId);
            fetchLoverInfo(storedUserId);
        } else {
            navigate('/login');
        }
    }, [navigate]);

    const fetchUserInfo = async (userId) => {
        try {
            const response = await fetch(`http://${baseUrl}/friend-info?userId=${userId}`, {
                method: 'GET',
                credentials: 'include'
            });
            const result = await response.json();
            if (result.code === '200') {
                setUserName(result.userNickName);
                setEditedUserName(result.userNickName);
                const firstChar = result.userNickName.charAt(0).toUpperCase();
                setUserAvatar(firstChar);
            } else {
                console.error('获取用户信息失败:', result.message);
            }
        } catch (error) {
            console.error('获取用户信息请求出错:', error);
        }
    };

    const fetchLoverInfo = async (userId) => {
        try {
            const response = await apiRequest('/lover-ship', 'POST', { userId });
            if (response && response.friends && response.friends.length > 0) {
                const loverId = response.friends[0];
                const loverData = await apiRequest('/friend-info', 'GET', { userId: loverId });
                if (loverData) {
                    setLoverInfo({
                        id: loverData.userId,
                        name: loverData.userNickName,
                        avatar: loverData.userNickName.charAt(0).toUpperCase()
                    });
                    setHasLover(true);
                }
            }
        } catch (error) {
            console.error('获取情侣信息请求出错:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = () => {
        setEditing(true);
    };

    const handleSave = () => {
        setUserName(editedUserName);
        setEditing(false);
    };

    const handleCancel = () => {
        setEditedUserName(userName);
        setEditing(false);
    };

    return (
        <Layout>
            <Box
                sx={{
                    minHeight: '100vh',
                    p: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    background: 'linear-gradient(135deg, #FFE4B5, #FFECD1)',
                    color: '#333'
                }}
            >
                <Card
                    sx={{
                        p: 4,
                        width: '100%',
                        maxWidth: 500,
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                        background: '#fff',
                        borderRadius: 8,
                        border: '1px solid #ccc'
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            mb: 4
                        }}
                    >
                        <Avatar sx={{ fontSize: '48px', mb: 2 }}>{userAvatar}</Avatar>
                        <Typography variant="h4" gutterBottom>
                            用户信息
                        </Typography>
                    </Box>
                    <CardContent>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                            编号: {userId}
                        </Typography>
                        {editing ? (
                            <TextField
                                label="用户名"
                                type="text"
                                value={editedUserName}
                                onChange={(e) => setEditedUserName(e.target.value)}
                                fullWidth
                                sx={{ mb: 3 }}
                            />
                        ) : (
                            <Typography variant="body1" sx={{ mb: 3 }}>
                                用户名: {userName}
                            </Typography>
                        )}
                    </CardContent>
                    {editing ? (
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                mt: 2
                            }}
                        >
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleSave}
                                sx={{ mr: 2 }}
                            >
                                保存
                            </Button>
                            <Button
                                variant="outlined"
                                onClick={handleCancel}
                            >
                                取消
                            </Button>
                        </Box>
                    ) : (
                        <Button
                            variant="outlined"
                            onClick={handleEdit}
                            sx={{ mt: 2 }}
                        >
                            编辑
                        </Button>
                    )}
                </Card>

                <Card
                    sx={{
                        p: 4,
                        width: '100%',
                        maxWidth: 500,
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                        background: '#fff',
                        borderRadius: 8,
                        border: '1px solid #ccc',
                        mt: 4
                    }}
                >
                    <Typography variant="h5" gutterBottom sx={{ textAlign: 'center' }}>
                        情侣信息
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    {loading ? (
                        <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
                            <Typography>加载中...</Typography>
                        </Box>
                    ) : hasLover ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 3 }}>
                            <Avatar sx={{ fontSize: '48px', mb: 2 }}>{loverInfo.avatar}</Avatar>
                            <Typography variant="body1" sx={{ mb: 1 }}>
                                情侣昵称: {loverInfo.name}
                            </Typography>
                            <Typography variant="body1">
                                情侣编号: {loverInfo.id}
                            </Typography>
                            <Button variant="outlined" color="secondary" sx={{ mt: 3 }}>
                                解除情侣关系
                            </Button>
                        </Box>
                    ) : (
                        <Box
                            sx={{
                                border: '2px dashed #ccc',
                                borderRadius: 8,
                                p: 4,
                                textAlign: 'center',
                                minHeight: 150,
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}
                        >
                            <Typography variant="body1" sx={{ mb: 2, color: '#666' }}>
                                你还没有情侣哦
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 3, color: '#888' }}>
                                绑定情侣解锁更多功能！
                            </Typography>
                            <Button variant="contained" color="primary" onClick={() => navigate('/bind-lover')}>
                                绑定情侣
                            </Button>
                        </Box>
                    )}
                </Card>
            </Box>
        </Layout>
    );
}

export default UserInfoPage;    