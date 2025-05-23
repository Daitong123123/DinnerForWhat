import React, { useState } from 'react';
import {
    Box,
    Typography,
    Card,
    Button,
    TextField,
    Alert,
    Dialog,
    DialogContent,
    DialogTitle,
    DialogContentText
} from '@mui/material';
import { useAuth } from './AuthContext.js';
import { useNavigate } from 'react-router-dom';
import COLORS from '../constants/color.js';

function LoginPage() {
    const [isLoginWithPhone, setIsLoginWithPhone] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async () => {
        if (isLoginWithPhone) {
            setErrorMessage('暂不支持手机号登录哦！');
            return;
        }
        
        try {
            await login({ username, password });
        } catch (error) {
            setErrorMessage(error.message || '登录失败，请重试');
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
                p: { xs: 6, md: 6 }, // 增加移动端内边距
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
                    p: { xs: 4, md: 6 }, // 移动端内边距适当减少
                    width: '100%',
                    maxWidth: 600,
                    boxShadow: '0 4px 20px rgba(255, 94, 135, 0.15)',
                    backgroundColor: 'white',
                    borderRadius: 10,
                    overflow: 'hidden'
                }}
            >
                {errorMessage && (
                    <Alert severity="error" sx={{ mb: 4, borderRadius: 8 }}>
                        {errorMessage}
                    </Alert>
                )}
                
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
                        fontSize: { xs: '1.8rem', md: '2.5rem' }, // 减小移动端字体大小
                        fontWeight: 'bold'
                    }}
                >
                    今天吃什么
                </Typography>
                
                <Box display="flex" justifyContent="center" mb={6}>
                    <Button
                        variant={!isLoginWithPhone ? "contained" : "outlined"}
                        sx={{ 
                            mr: 2, 
                            borderRadius: 100, 
                            px: { xs: 2, md: 6 }, // 减小移动端按钮内边距
                            py: { xs: 1.5, md: 2 }, // 减小移动端按钮高度
                            fontSize: { xs: '0.9rem', md: '1rem' }, // 减小移动端字体大小
                            color: !isLoginWithPhone ? 'white' : COLORS.primary,
                            backgroundColor: !isLoginWithPhone ? COLORS.primary : 'white',
                            borderColor: COLORS.primary,
                            '&:hover': {
                                backgroundColor: !isLoginWithPhone ? `${COLORS.primary}DD` : 'rgba(255, 94, 135, 0.05)'
                            }
                        }}
                        onClick={() => setIsLoginWithPhone(false)}
                    >
                        用户名登录
                    </Button>
                    <Button
                        variant={isLoginWithPhone ? "contained" : "outlined"}
                        sx={{ 
                            borderRadius: 100, 
                            px: { xs: 2, md: 6 }, // 减小移动端按钮内边距
                            py: { xs: 1.5, md: 2 }, // 减小移动端按钮高度
                            fontSize: { xs: '0.9rem', md: '1rem' }, // 减小移动端字体大小
                            color: isLoginWithPhone ? 'white' : COLORS.primary,
                            backgroundColor: isLoginWithPhone ? COLORS.primary : 'white',
                            borderColor: COLORS.primary,
                            '&:hover': {
                                backgroundColor: isLoginWithPhone ? `${COLORS.primary}DD` : 'rgba(255, 94, 135, 0.05)'
                            }
                        }}
                        onClick={handlePhoneLoginClick}
                    >
                        手机号登录
                    </Button>
                </Box>
                
                {!isLoginWithPhone && (
                    <TextField
                        label="用户名"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
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
                )}
                
                <TextField
                    label="密码"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                    onClick={handleLogin}
                    fullWidth
                    disabled={!username || !password}
                    sx={{
                        borderRadius: 100,
                        py: { xs: 1, md: 3 }, // 减小移动端按钮高度
                        textTransform: 'none',
                        fontSize: { xs: '1rem', md: '1.1rem' }, // 减小移动端字体大小
                        fontWeight: 'bold',
                        background: `linear-gradient(45deg, ${COLORS.primary}, ${COLORS.secondary})`,
                        boxShadow: `0 4px 20px rgba(255, 94, 135, 0.3)`,
                        '&:hover': {
                            background: `linear-gradient(45deg, ${COLORS.secondary}, ${COLORS.primary})`,
                            boxShadow: `0 6px 25px rgba(255, 94, 135, 0.4)`
                        }
                    }}
                >
                    登录
                </Button>
                
                <Button
                    variant="text"
                    onClick={() => navigate('/register')}
                    sx={{ 
                        mt: 4,
                        color: COLORS.primary,
                        '&:hover': {
                            color: `${COLORS.primary}DD`
                        }
                    }}
                >
                    还没有账号？立即注册
                </Button>
            </Card>
            
            <Dialog
                open={openDialog}
                onClose={handleCloseDialog}
                aria-labelledby="phone-login-dialog-title"
                sx={{
                    '&.MuiPaper-root': {
                        backgroundImage: 'url("https://picsum.photos/800/600")',
                        backgroundSize: 'cover',
                        borderRadius: 16,
                        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)'
                    }
                }}
            >
                <DialogTitle 
                    id="phone-login-dialog-title" 
                    sx={{ 
                        fontFamily: '楷体',
                        color: COLORS.primary,
                        fontWeight: 'bold'
                    }}
                >
                    手机号登录
                </DialogTitle>
                <DialogContent sx={{ fontFamily: '楷体' }}>
                    <DialogContentText>
                        暂不支持手机号登录，请使用用户名登录。
                    </DialogContentText>
                </DialogContent>
            </Dialog>
            
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

export default LoginPage;