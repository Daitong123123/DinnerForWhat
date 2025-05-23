import React, { useState } from 'react';
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
import { useNavigate } from 'react-router-dom';
import COLORS from '../constants/color.js';

function RegisterPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleRegistration = async () => {
        if (!username) {
            setError('请输入用户名');
            return;
        }
        
        if (!password) {
            setError('请输入密码');
            return;
        }
        
        if (password !== confirmPassword) {
            setError('两次输入的密码不一致');
            return;
        }
        
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
            setError('注册请求出错，请稍后再试');
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                p: 6,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: COLORS.light,
                color: COLORS.dark,
                pb: 6
            }}
        >
            <Card
                sx={{
                    p: 4,
                    width: '100%',
                    maxWidth: 600,
                    boxShadow: '0 4px 20px rgba(255, 94, 135, 0.15)',
                    backgroundColor: 'white',
                    borderRadius: 10,
                    overflow: 'hidden'
                }}
            >
                <Typography
                    variant="h4"
                    gutterBottom
                    sx={{
                        background: `linear-gradient(45deg, ${COLORS.primary}, ${COLORS.secondary})`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        textFillColor: 'transparent',
                        textAlign: 'center',
                        mb: 6,
                        fontSize: { xs: '2rem', md: '2.5rem' },
                        fontWeight: 'bold'
                    }}
                >
                    注册账号
                </Typography>
                
                {error && (
                    <Alert severity="error" sx={{ mb: 4, borderRadius: 8 }}>
                        {error}
                    </Alert>
                )}
                
                {success && (
                    <Alert severity="success" sx={{ mb: 4, borderRadius: 8 }}>
                        {success}
                    </Alert>
                )}
                
                <TextField
                    label="用户名"
                    type="text"
                    value={username}
                    onChange={(e) => {
                        setUsername(e.target.value);
                        if (error) setError('');
                    }}
                    fullWidth
                    sx={{ 
                        mb: 4,
                        borderRadius: 16,
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 16,
                            '&:hover fieldset': {
                                borderColor: COLORS.primary
                            },
                            '&.Mui-focused fieldset': {
                                borderColor: COLORS.primary
                            }
                        }
                    }}
                    error={!!error}
                    helperText={error}
                />
                
                <TextField
                    label="密码"
                    type="password"
                    value={password}
                    onChange={(e) => {
                        setPassword(e.target.value);
                        if (error) setError('');
                    }}
                    fullWidth
                    sx={{ 
                        mb: 4,
                        borderRadius: 16,
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 16,
                            '&:hover fieldset': {
                                borderColor: COLORS.primary
                            },
                            '&.Mui-focused fieldset': {
                                borderColor: COLORS.primary
                            }
                        }
                    }}
                />
                
                <TextField
                    label="确认密码"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (error) setError('');
                    }}
                    fullWidth
                    sx={{ 
                        mb: 6,
                        borderRadius: 16,
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 16,
                            '&:hover fieldset': {
                                borderColor: COLORS.primary
                            },
                            '&.Mui-focused fieldset': {
                                borderColor: COLORS.primary
                            }
                        }
                    }}
                />
                
                <Button
                    variant="contained"
                    onClick={handleRegistration}
                    fullWidth
                    disabled={!username || !password || !confirmPassword}
                    sx={{
                        borderRadius: 100,
                        py:{ xs: 1, md: 3},
                        textTransform: 'none',
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        background: `linear-gradient(45deg, ${COLORS.primary}, ${COLORS.secondary})`,
                        boxShadow: `0 4px 20px rgba(255, 94, 135, 0.3)`,
                        '&:hover': {
                            background: `linear-gradient(45deg, ${COLORS.secondary}, ${COLORS.primary})`,
                            boxShadow: `0 6px 25px rgba(255, 94, 135, 0.4)`
                        }
                    }}
                >
                    注册
                </Button>
                
                <Button
                    variant="text"
                    onClick={() => navigate('/')}
                    sx={{ 
                        mt: 4,
                        color: COLORS.primary,
                        '&:hover': {
                            color: `${COLORS.primary}DD`
                        }
                    }}
                >
                    已有账号？立即登录
                </Button>
            </Card>
            
            <Box sx={{ width: '100%', maxWidth: 600, mt: 8 }}>
                <Box sx={{ borderTop: `1px solid ${COLORS.gray}`, mb: 2 }} />
                <Typography
                    variant="body2"
                    sx={{
                        color: COLORS.gray,
                        textAlign: 'center'
                    }}
                >
                    鄂ICP备2025107386号
                </Typography>
            </Box>
        </Box>
    );
}

export default RegisterPage;    