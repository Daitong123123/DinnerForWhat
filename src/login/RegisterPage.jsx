import React, { useState } from'react';
import baseUrl from '../config.js';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Button,
    TextField,
    Select,
    MenuItem,
    InputLabel,
    FormControl
} from '@mui/material';
import { useNavigate } from'react-router-dom';

function RegisterPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const navigate = useNavigate();

    const handleRegistration = async () => {
        if (password === confirmPassword) {
            try {
                const response = await fetch(`http://${baseUrl}/register`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        username,
                        password
                    })
                });
                const result = await response.json();
                if (result.code === '200') {
                    // 注册成功，跳转到dish页面
                    navigate('/dish');
                } else {
                    alert(result.message);
                }
            } catch (error) {
                console.error('注册请求出错:', error);
                alert('注册请求出错，请稍后再试');
            }
        } else {
            alert('两次输入的密码不一致');
        }
    };

    return (
        <Box sx={{
            minHeight: '100vh',
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #FFE4B5, #FFECD1)',
            color: '#333'
        }}>
            <Card sx={{
                p: 4,
                width: '100%',
                maxWidth: 500,
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                background: '#fff',
                borderRadius: 8,
                border: '1px solid #ccc'
            }}>
                <Typography variant="h4" gutterBottom sx={{
                    background: 'linear-gradient(45deg, #FF6F61, #FFB142)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    textFillColor: 'transparent',
                    textAlign: 'center',
                    mb: 4
                }}>
                    菜谱项目注册
                </Typography>
                <TextField
                    label="用户名"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    fullWidth
                    sx={{ mb: 3 }}
                    InputProps={{
                        sx: { color: '#333' }
                    }}
                    InputLabelProps={{
                        sx: { color: '#666' }
                    }}
                />
                <TextField
                    label="密码"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    fullWidth
                    sx={{ mb: 3 }}
                    InputProps={{
                        sx: { color: '#333' }
                    }}
                    InputLabelProps={{
                        sx: { color: '#666' }
                    }}
                />
                <TextField
                    label="确认密码"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    fullWidth
                    sx={{ mb: 3 }}
                    InputProps={{
                        sx: { color: '#333' }
                    }}
                    InputLabelProps={{
                        sx: { color: '#666' }
                    }}
                />
                <Button
                    variant="contained"
                    onClick={handleRegistration}
                    fullWidth
                    sx={{
                        background: 'linear-gradient(45deg, #FF6F61, #FFB142)',
                        '&:hover': {
                            background: 'linear-gradient(45deg, #FFB142, #FF6F61)'
                        }
                    }}
                >
                    注册
                </Button>
            </Card>
        </Box>
    );
}

export default RegisterPage;