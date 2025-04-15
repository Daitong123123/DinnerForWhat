import React, { useState, useEffect } from'react';
import { Box, Typography, Card, CardContent, Button, TextField, Select, MenuItem, InputLabel, FormControl, Stack } from '@mui/material';
import { useNavigate } from'react-router-dom';

function PhoneBindingPage() {
    const [phone, setPhone] = useState('');
    const [countdown, setCountdown] = useState(0);
    const [verificationCode, setVerificationCode] = useState('');
    const navigate = useNavigate();

    const sendVerificationCode = () => {
        if (phone) {
            console.log('发送验证码到:', phone);
            setCountdown(60);
            const timer = setInterval(() => {
                setCountdown((prevCountdown) => {
                    const newCountdown = prevCountdown - 1;
                    if (newCountdown === 0) {
                        clearInterval(timer);
                    }
                    return newCountdown;
                });
            }, 1000);
        } else {
            alert('请输入手机号');
        }
    };

    const handleSkipBinding = () => {
        navigate('/dish');
    };

    useEffect(() => {
        if (countdown === 0) {
            // 倒计时结束后的逻辑，这里可以添加重新发送验证码的提示等
        }
    }, [countdown]);

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
                    绑定手机号
                </Typography>
                <TextField
                    label="手机号"
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    fullWidth
                    sx={{ mb: 3 }}
                    InputProps={{
                        sx: { color: '#333' }
                    }}
                    InputLabelProps={{
                        sx: { color: '#666' }
                    }}
                />
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
                    <TextField
                        label="验证码"
                        type="text"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        fullWidth
                        InputProps={{
                            sx: { color: '#333' }
                        }}
                        InputLabelProps={{
                            sx: { color: '#666' }
                        }}
                    />
                    <Button
                        variant="outlined"
                        color="primary"
                        onClick={sendVerificationCode}
                        disabled={countdown > 0}
                        sx={{
                            backgroundColor: countdown > 0? 'rgba(0, 123, 255, 0.3)' : 'rgba(0, 123, 255, 0.1)',
                            borderColor: '#007bff',
                            color: '#007bff',
                            '&:hover': {
                                backgroundColor: 'rgba(0, 123, 255, 0.2)'
                            },
                            opacity: countdown > 0? 0.5 : 1
                        }}
                    >
                        {countdown > 0? `${countdown}s 后重试` : '发送验证码'}
                    </Button>
                </Stack>
                <Button
                    variant="contained"
                    onClick={() => {
                        console.log('验证码验证成功');
                        navigate('/dish');
                    }}
                    fullWidth
                    sx={{
                        background: 'linear-gradient(45deg, #FF6F61, #FFB142)',
                        '&:hover': {
                            background: 'linear-gradient(45deg, #FFB142, #FF6F61)'
                        }
                    }}
                >
                    绑定手机号
                </Button>
                <Button
                    variant="outlined"
                    onClick={handleSkipBinding}
                    fullWidth
                    sx={{ mt: 2 }}
                >
                    跳过绑定
                </Button>
            </Card>
        </Box>
    );
}

export default PhoneBindingPage;    