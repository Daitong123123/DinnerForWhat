import React, { useState, useEffect } from'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Button,
    Avatar,
    TextField
} from '@mui/material';
import { useNavigate } from'react-router-dom';
import baseUrl from './config.js';

import BottomNavigationBar from './BottomNavigationBar.jsx';

function UserInfoPage() {
    const navigate = useNavigate();
    const [userId, setUserId] = useState('');
    const [userName, setUserName] = useState('');
    const [userAvatar, setUserAvatar] = useState('U'); // 这里可以根据实际情况设置默认头像，比如从后端获取
    const [editing, setEditing] = useState(false);
    const [editedUserName, setEditedUserName] = useState('');
    useEffect(() => {
        document.title = '今天吃什么';
        const storedUserId = localStorage.getItem('userId');
        if (storedUserId) {
            setUserId(storedUserId);
            fetchUserInfo(storedUserId);
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
                // 这里可以根据后端返回的头像信息设置 userAvatar，暂时用首字母代替
                const firstChar = result.userNickName.charAt(0).toUpperCase();
                setUserAvatar(firstChar);
            } else {
                console.error('获取用户信息失败:', result.message);
            }
        } catch (error) {
            console.error('获取用户信息请求出错:', error);
        }
    };

    const handleEdit = () => {
        setEditing(true);
    };

    const handleSave = () => {
        // 这里可以添加保存逻辑，调用后端接口保存修改后的用户名
        // 暂时只做简单的状态更新
        setUserName(editedUserName);
        setEditing(false);
    };

    const handleCancel = () => {
        setEditedUserName(userName);
        setEditing(false);
    };

    return (
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
                    {editing? (
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
                {editing? (
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
            <BottomNavigationBar />
        </Box>
    );
}

export default UserInfoPage;