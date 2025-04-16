import React, { useState } from'react';
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
    FormControl,
    Alert,
    Dialog,
    DialogContent,
    DialogTitle
} from '@mui/material';
import { useNavigate } from'react-router-dom';
import baseUrl from '../config.js';

function LoginPage() {
    const [isLoginWithPhone, setIsLoginWithPhone] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const handleLogin = async () => {
        let loginData;
        if (isLoginWithPhone) {
            setErrorMessage('暂不支持手机号登录哦！');
            return;
        } else {
            loginData = { username, password };
        }
        try {
            const response = await fetch(`${baseUrl}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(loginData),
                credentials: 'include'
            });
            const result = await response.json();
            if (result.code === '200') {
                // 跳转到 DishPage
                navigate('/dish');
            } else {
                setErrorMessage(result.message);
            }
        } catch (error) {
            console.error('登录请求出错:', error);
            setErrorMessage('登录请求出错，请稍后再试');
        }
    };

    const handlePhoneLoginClick = () => {
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setIsLoginWithPhone(false);
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
            <Box
                sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '100%'
                }}
            >
                {errorMessage && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {errorMessage}
                    </Alert>
                )}
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
                            mb: 4
                        }}
                    >
                        菜菜记
                    </Typography>
                    <div style={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
                        <Button
                            variant="contained"
                            sx={{ mr: 2, backgroundColor:!isLoginWithPhone? '#FF6F61' : '#ccc', color: 'white' }}
                            onClick={() => setIsLoginWithPhone(false)}
                        >
                            用户名登录
                        </Button>
                        <Button
                            variant="contained"
                            sx={{ backgroundColor: isLoginWithPhone? '#FF6F61' : '#ccc', color: 'white' }}
                            onClick={handlePhoneLoginClick}
                        >
                            手机号登录
                        </Button>
                    </div>
                    {!isLoginWithPhone && (
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
                    <Button
                        variant="contained"
                        onClick={handleLogin}
                        fullWidth
                        sx={{
                            background: 'linear-gradient(45deg, #FF6F61, #FFB142)',
                            '&:hover': {
                                background: 'linear-gradient(45deg, #FFB142, #FF6F61)'
                            }
                        }}
                    >
                        登录
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={() => navigate('/register')}
                        sx={{ mt: 2 }}
                    >
                        立即注册
                    </Button>
                </Card>
            </Box>
            <Box sx={{ width: '100%', maxWidth: 500 }}>
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

export default LoginPage;