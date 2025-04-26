import React, { useState } from'react';
import baseUrl from '../config.js';
import {
    Box,
    Typography,
    Card,
    Button,
    TextField,
    Alert,
    IconButton,
    InputAdornment
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from'react-router-dom';

function RegisterPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
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
                    // 注册成功，显示成功提示
                    setError('');
                    setSuccess('注册成功！即将跳转...');
                    setTimeout(() => {
                        navigate('/dish');
                    }, 1500);
                } else {
                    setError(result.message);
                }
            } catch (error) {
                console.error('注册请求出错:', error);
                alert('注册请求出错，请稍后再试');
            }
        } else {
            setError('两次输入的密码不一致');
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f4f4f4',
                color: '#333',
                pb: 6
            }}
        >
            <Card
                sx={{
                    p: 3,
                    width: '100%',
                    maxWidth: 600,
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                    backgroundColor: '#fff',
                    borderRadius: 10,
                    overflow: 'hidden'
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
                        textAlign: 'center',
                        mb: 3
                    }}
                >
                    菜谱项目注册
                </Typography>
                <TextField
                    label="用户名"
                    type="text"
                    value={username}
                    onChange={(e) => {
                        setUsername(e.target.value);
                        setError('');
                    }}
                    fullWidth
                    sx={{ mb: 3 }}
                    InputProps={{
                        sx: { color: '#333' },
                        endAdornment: error && (
                            <InputAdornment position="end">
                                <IconButton
                                    edge="end"
                                    onClick={() => setError('')}
                                >
                                    <CloseIcon color="error" />
                                </IconButton>
                            </InputAdornment>
                        )
                    }}
                    InputLabelProps={{
                        sx: { color: '#666' }
                    }}
                    error={!!error}
                    helperText={error}
                />
                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}
                {success && (
                    <Alert severity="success" sx={{ mb: 3 }}>
                        {success}
                    </Alert>
                )}
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
            <Box sx={{ width: '100%', maxWidth: 600 }}>
                <Box sx={{ borderTop: '1px solid #ccc', mb: 2 }} />
                <Typography
                    variant="body2"
                    sx={{
                        color: '#999',
                        textAlign: 'left'
                    }}
                >
                    鄂ICP备2025107386号
                </Typography>
            </Box>
        </Box>
    );
}

export default RegisterPage;