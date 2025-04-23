import React, { useState , useEffect} from'react';
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
    DialogTitle,
    DialogContentText
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
            const response = await fetch(`http://${baseUrl}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(loginData),
                credentials: 'include'
            });
            const result = await response.json();
            if (result.code === '200') {
                // 提取响应头中的 userId
                const userId = response.headers.get('userid');
                // 保存用户信息到本地存储
                localStorage.setItem('userId', userId);
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

    useEffect(() => {
        document.title = '今天吃什么';
    }, []);

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
                {errorMessage && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {errorMessage}
                    </Alert>
                )}
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
                    饭菜小记
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
            <Dialog
                open={openDialog}
                onClose={handleCloseDialog}
                aria-labelledby="phone-login-dialog-title"
                sx={{
                    '&.MuiPaper-root': {
                        backgroundImage: 'url("https://example.com/book-background.jpg")', // 替换为真实的书本背景图片地址
                        backgroundSize: 'cover',
                        borderRadius: 10,
                        boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)'
                    }
                }}
            >
                <DialogTitle id="phone-login-dialog-title" sx={{ fontFamily: '楷体' }}>手机号登录</DialogTitle>
                <DialogContent sx={{ fontFamily: '楷体' }}>
                    <DialogContentText>
                        暂不支持手机号登录，请使用用户名登录。
                    </DialogContentText>
                </DialogContent>
            </Dialog>
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

export default LoginPage;