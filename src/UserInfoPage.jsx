import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Button,
    Avatar,
    TextField,
    Divider,
    Alert,
    CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import baseUrl from './config.js';
import apiRequest from './api.js';
import BottomNavigationBar from './BottomNavigationBar.jsx';
import Layout from './Layout.jsx';

// 恋爱记风格配色
const COLORS = {
    primary: '#FF5E87',
    secondary: '#FFB6C1',
    accent: '#FF85A2',
    light: '#FFF0F3',
    dark: '#333333'
};

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
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        document.title = '我的信息';
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
                setError('获取用户信息失败');
            }
        } catch (error) {
            console.error('获取用户信息请求出错:', error);
            setError('网络请求失败');
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
            setError('获取情侣信息失败');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = () => {
        setEditing(true);
    };

    const handleSave = async () => {
        if (editedUserName.trim() === '') {
            setError('用户名不能为空');
            return;
        }
        
        try {
            setLoading(true);
            const response = await apiRequest('/update-user-info', 'POST', {
                userId,
                userNickName: editedUserName
            });
            
            if (response && response.code === '200') {
                setUserName(editedUserName);
                setEditing(false);
                setSuccess('用户名更新成功');
            } else {
                setError('更新失败，请重试');
            }
        } catch (error) {
            console.error('更新用户信息出错:', error);
            setError('网络请求失败');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setEditedUserName(userName);
        setEditing(false);
    };

    const handleUnbindLover = async () => {
        if (!hasLover || !loverInfo) return;
        
        if (window.confirm('确定要解除情侣关系吗？')) {
            try {
                setLoading(true);
                const response = await apiRequest('/unbind-lover', 'POST', {
                    userId,
                    loverId: loverInfo.id
                });
                
                if (response && response.code === '200') {
                    setHasLover(false);
                    setLoverInfo(null);
                    setSuccess('已解除情侣关系');
                } else {
                    setError('解除失败，请重试');
                }
            } catch (error) {
                console.error('解除情侣关系出错:', error);
                setError('网络请求失败');
            } finally {
                setLoading(true);
                setTimeout(() => {
                    setLoading(false);
                }, 1000);
            }
        }
    };

    return (
        <Layout>
            <Box
                sx={{
                    minHeight: '100vh',
                    p: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    backgroundColor: COLORS.light
                }}
            >
                {error && (
                    <Alert severity="error" sx={{ mb: 4, width: '100%', maxWidth: 500, borderRadius: 8 }}>
                        {error}
                    </Alert>
                )}
                
                {success && (
                    <Alert severity="success" sx={{ mb: 4, width: '100%', maxWidth: 500, borderRadius: 8 }}>
                        {success}
                    </Alert>
                )}

                <Card
                    sx={{
                        p: 4,
                        width: '100%',
                        maxWidth: 500,
                        boxShadow: '0 4px 20px rgba(255, 94, 135, 0.1)',
                        backgroundColor: 'white',
                        borderRadius: 16,
                        mb: 4,
                        border: 'none',
                        transform: 'translateY(0)',
                        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                        '&:hover': {
                            transform: 'translateY(-5px)',
                            boxShadow: '0 8px 30px rgba(255, 94, 135, 0.2)'
                        }
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
                        <Avatar 
                            sx={{ 
                                width: 80, 
                                height: 80, 
                                fontSize: '40px', 
                                mb: 2, 
                                backgroundColor: COLORS.primary,
                                color: 'white',
                                boxShadow: '0 4px 15px rgba(255, 94, 135, 0.3)'
                            }}
                        >
                            {userAvatar}
                        </Avatar>
                        <Typography variant="h4" gutterBottom sx={{ color: COLORS.dark, fontWeight: 'bold' }}>
                            用户信息
                        </Typography>
                    </Box>
                    <CardContent>
                        <Typography variant="body1" sx={{ mb: 2, color: COLORS.dark }}>
                            编号: <span sx={{ color: COLORS.primary }}>{userId}</span>
                        </Typography>
                        {editing ? (
                            <TextField
                                label="用户名"
                                type="text"
                                value={editedUserName}
                                onChange={(e) => setEditedUserName(e.target.value)}
                                fullWidth
                                sx={{ 
                                    mb: 3,
                                    '& .MuiOutlinedInput-root': {
                                        '&:hover fieldset': {
                                            borderColor: COLORS.primary
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: COLORS.primary
                                        }
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': {
                                        color: COLORS.primary
                                    }
                                }}
                            />
                        ) : (
                            <Typography variant="body1" sx={{ mb: 3, color: COLORS.dark }}>
                                用户名: <span sx={{ color: COLORS.primary, fontWeight: 'bold' }}>{userName}</span>
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
                                sx={{ 
                                    mr: 2,
                                    backgroundColor: COLORS.primary,
                                    color: 'white',
                                    borderRadius: 100,
                                    padding: '8px 24px',
                                    textTransform: 'none',
                                    boxShadow: '0 4px 12px rgba(255, 94, 135, 0.2)',
                                    '&:hover': {
                                        backgroundColor: '#FF4778',
                                        boxShadow: '0 6px 16px rgba(255, 94, 135, 0.3)'
                                    }
                                }}
                            >
                                保存
                            </Button>
                            <Button
                                variant="outlined"
                                onClick={handleCancel}
                                sx={{ 
                                    color: COLORS.primary,
                                    borderColor: COLORS.primary,
                                    borderRadius: 100,
                                    padding: '8px 24px',
                                    textTransform: 'none',
                                    '&:hover': {
                                        borderColor: '#FF4778',
                                        backgroundColor: 'rgba(255, 94, 135, 0.05)'
                                    }
                                }}
                            >
                                取消
                            </Button>
                        </Box>
                    ) : (
                        <Button
                            variant="outlined"
                            onClick={handleEdit}
                            sx={{ 
                                mt: 2,
                                color: COLORS.primary,
                                borderColor: COLORS.primary,
                                borderRadius: 100,
                                padding: '8px 24px',
                                textTransform: 'none',
                                '&:hover': {
                                    borderColor: '#FF4778',
                                    backgroundColor: 'rgba(255, 94, 135, 0.05)'
                                }
                            }}
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
                        boxShadow: '0 4px 20px rgba(255, 94, 135, 0.1)',
                        backgroundColor: 'white',
                        borderRadius: 16,
                        border: 'none',
                        transform: 'translateY(0)',
                        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                        '&:hover': {
                            transform: 'translateY(-5px)',
                            boxShadow: '0 8px 30px rgba(255, 94, 135, 0.2)'
                        }
                    }}
                >
                    <Typography variant="h5" gutterBottom sx={{ textAlign: 'center', color: COLORS.dark, fontWeight: 'bold' }}>
                        情侣信息
                    </Typography>
                    <Divider sx={{ my: 2, borderColor: COLORS.secondary }} />
                    {loading ? (
                        <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
                            <CircularProgress color="primary" />
                        </Box>
                    ) : hasLover ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 3 }}>
                            <Avatar 
                                sx={{ 
                                    width: 80, 
                                    height: 80, 
                                    fontSize: '40px', 
                                    mb: 2, 
                                    backgroundColor: COLORS.secondary,
                                    color: 'white',
                                    boxShadow: '0 4px 15px rgba(255, 182, 193, 0.3)'
                                }}
                            >
                                {loverInfo.avatar}
                            </Avatar>
                            <Typography variant="body1" sx={{ mb: 1, color: COLORS.dark }}>
                                情侣昵称: <span sx={{ color: COLORS.primary, fontWeight: 'bold' }}>{loverInfo.name}</span>
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 3, color: COLORS.dark }}>
                                情侣编号: <span sx={{ color: COLORS.primary }}>{loverInfo.id}</span>
                            </Typography>
                            <Button 
                                variant="outlined" 
                                color="error" 
                                sx={{ 
                                    mt: 1,
                                    color: COLORS.primary,
                                    borderColor: COLORS.primary,
                                    borderRadius: 100,
                                    padding: '8px 24px',
                                    textTransform: 'none',
                                    '&:hover': {
                                        backgroundColor: 'rgba(255, 94, 135, 0.1)',
                                        borderColor: '#FF4778'
                                    }
                                }}
                                onClick={handleUnbindLover}
                            >
                                解除情侣关系
                            </Button>
                        </Box>
                    ) : (
                        <Box
                            sx={{
                                border: `2px dashed ${COLORS.secondary}`,
                                borderRadius: 16,
                                p: 6,
                                textAlign: 'center',
                                minHeight: 180,
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                backgroundColor: 'rgba(255, 182, 193, 0.05)'
                            }}
                        >
                            <Typography variant="body1" sx={{ mb: 2, color: COLORS.dark, fontWeight: 'bold' }}>
                                你还没有情侣哦
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 4, color: COLORS.dark }}>
                                绑定情侣解锁更多专属功能！
                            </Typography>
                            <Button 
                                variant="contained" 
                                color="primary" 
                                onClick={() => navigate('/bind-lover')}
                                sx={{
                                    backgroundColor: COLORS.primary,
                                    color: 'white',
                                    borderRadius: 100,
                                    padding: '10px 32px',
                                    textTransform: 'none',
                                    boxShadow: '0 4px 12px rgba(255, 94, 135, 0.2)',
                                    '&:hover': {
                                        backgroundColor: '#FF4778',
                                        boxShadow: '0 6px 16px rgba(255, 94, 135, 0.3)'
                                    }
                                }}
                            >
                                绑定情侣
                            </Button>
                        </Box>
                    )}
                </Card>

                {/* 只有在没有选中好友时才显示底部导航栏 */}
                <BottomNavigationBar />
            </Box>
        </Layout>
    );
}

export default UserInfoPage;    