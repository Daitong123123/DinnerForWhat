import React, { useState, useEffect } from'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Button,
    TextField,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Avatar,
    Divider,
    Alert,
    CircularProgress
} from '@mui/material';
import { useNavigate } from'react-router-dom';
import baseUrl from './config.js';
import apiRequest from './api.js';
import BottomNavigationBar from './BottomNavigationBar.jsx';

// 恋爱记风格配色
const COLORS = {
    primary: '#FF5E87',
    secondary: '#FFB6C1',
    accent: '#FF85A2',
    light: '#FFF0F3',
    dark: '#333333'
};

function BindLoverPage() {
    const navigate = useNavigate();
    const [userId, setUserId] = useState('');
    const [loverId, setLoverId] = useState('');
    const [message, setMessage] = useState('我想和你成为情侣');
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        document.title = '情侣绑定';
        const storedUserId = localStorage.getItem('userId');
        if (storedUserId) {
            setUserId(storedUserId);
            fetchRequests(storedUserId);
        } else {
            navigate('/login');
        }
    }, [navigate]);

    const fetchRequests = async (userId) => {
        try {
            const response = await apiRequest('/lover-request-query', 'POST', { userId });
            if (response && response.friendToBeRequestList) {
                // 处理接收到的请求（对方申请我）
                const receivedRequests = response.friendToBeRequestList
                    .filter(req => req.requestTo === userId && req.status === '0')
                    .map(req => ({
                        id: req.requestFrom,
                        content: req.content,
                        type: 'received'
                    }));
                
                // 处理已发出的请求（我申请对方）
                const sentRequests = response.friendToBeRequestList
                    .filter(req => req.requestFrom === userId && req.status === '0')
                    .map(req => ({
                        id: req.requestTo,
                        content: req.content,
                        type: 'sent'
                    }));
                
                setRequests([...receivedRequests, ...sentRequests]);
            }
        } catch (error) {
            console.error('获取情侣申请请求出错:', error);
            setError('获取申请列表失败');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitRequest = async () => {
        if (!loverId) {
            setError('请输入对方ID');
            return;
        }

        if (loverId === userId) {
            setError('不能绑定自己为情侣');
            return;
        }

        try {
            setLoading(true);
            setError('');
            setSuccess('');
            
            await apiRequest('/lover-request', 'POST', {
                userId,
                friendId: loverId,
                content: message || '我想和你成为情侣'
            });
            
            setSuccess('情侣申请已发送，等待对方确认');
            setLoverId('');
            setMessage('我想和你成为情侣');
            // 刷新请求列表
            fetchRequests(userId);
        } catch (error) {
            console.error('发送情侣申请出错:', error);
            setError('发送申请失败');
        } finally {
            setLoading(false);
        }
    };

    const handleAgreeRequest = async (requestId) => {
        try {
            setLoading(true);
            setError('');
            setSuccess('');
            
            await apiRequest('/lover-request-agree', 'POST', {
                userId,
                friendId: requestId
            });
            
            setSuccess('已同意情侣申请');
            // 刷新请求列表
            fetchRequests(userId);
        } catch (error) {
            console.error('同意情侣申请出错:', error);
            setError('同意申请失败');
        } finally {
            setLoading(false);
        }
    };

    const handleDisagreeRequest = async (requestId) => {
        try {
            setLoading(true);
            setError('');
            setSuccess('');
            
            await apiRequest('/lover-request-disagree', 'POST', {
                userId,
                friendId: requestId
            });
            
            setSuccess('已拒绝情侣申请');
            // 刷新请求列表
            fetchRequests(userId);
        } catch (error) {
            console.error('拒绝情侣申请出错:', error);
            setError('拒绝申请失败');
        } finally {
            setLoading(false);
        }
    };

    return (
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
            <Typography variant="h4" gutterBottom sx={{ mt: 4, mb: 4, fontWeight: 'bold', color: COLORS.dark }}>
                情侣绑定
            </Typography>

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
                <Typography variant="h5" gutterBottom sx={{ color: COLORS.dark, fontWeight: 'bold' }}>
                    发送情侣申请
                </Typography>
                <Divider sx={{ my: 2, borderColor: COLORS.secondary }} />
                <CardContent>
                    <TextField
                        label="对方ID"
                        type="text"
                        value={loverId}
                        onChange={(e) => setLoverId(e.target.value)}
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
                    <TextField
                        label="附言（选填）"
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
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
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSubmitRequest}
                        fullWidth
                        disabled={loading}
                        sx={{ 
                            mt: 2,
                            backgroundColor: COLORS.primary,
                            color: 'white',
                            borderRadius: 100,
                            padding: '10px',
                            textTransform: 'none',
                            boxShadow: '0 4px 12px rgba(255, 94, 135, 0.2)',
                            '&:hover': {
                                backgroundColor: '#FF4778',
                                boxShadow: '0 6px 16px rgba(255, 94, 135, 0.3)'
                            }
                        }}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : '发送申请'}
                    </Button>
                </CardContent>
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
                <Typography variant="h5" gutterBottom sx={{ color: COLORS.dark, fontWeight: 'bold' }}>
                    申请管理
                </Typography>
                <Divider sx={{ my: 2, borderColor: COLORS.secondary }} />
                <CardContent>
                    {loading && (
                        <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
                            <CircularProgress color="primary" />
                        </Box>
                    )}
                    {!loading && requests.length === 0 && (
                        <Box sx={{ py: 6, textAlign: 'center' }}>
                            <Typography color={COLORS.dark}>暂无待处理的情侣申请</Typography>
                        </Box>
                    )}
                    {requests.length > 0 && (
                        <List>
                            {requests.map((request, index) => (
                                <React.Fragment key={request.id}>
                                    <ListItem alignItems="flex-start" sx={{
                                        borderRadius: 12,
                                        marginBottom: '8px',
                                        '&:hover': {
                                            backgroundColor: COLORS.light
                                        }
                                    }}>
                                        <ListItemAvatar>
                                            <Avatar sx={{ 
                                                width: 48, 
                                                height: 48,
                                                backgroundColor: request.type === 'received' ? COLORS.primary : COLORS.secondary
                                            }}>
                                                {request.id.charAt(0).toUpperCase()}
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={request.id}
                                            secondary={
                                                <React.Fragment>
                                                    <Typography
                                                        sx={{ display: 'inline' }}
                                                        component="span"
                                                        variant="body2"
                                                        color={COLORS.dark}
                                                    >
                                                        {request.type === 'received' 
                                                            ? `${request.id}请求和你成为情侣` 
                                                            : `你已向${request.id}发送情侣申请`}
                                                    </Typography>
                                                    {request.content && (
                                                        <Typography
                                                            sx={{ display: 'block', mt: 1 }}
                                                            component="span"
                                                            variant="body2"
                                                            color={COLORS.dark}
                                                        >
                                                            附言: {request.content}
                                                        </Typography>
                                                    )}
                                                </React.Fragment>
                                            }
                                        />
                                        {request.type === 'received' && (
                                            <Box sx={{ display: 'flex', flexDirection: 'column', ml: 2 }}>
                                                <Button
                                                    variant="contained"
                                                    color="primary"
                                                    size="small"
                                                    onClick={() => handleAgreeRequest(request.id)}
                                                    sx={{ 
                                                        mb: 1,
                                                        backgroundColor: COLORS.primary,
                                                        color: 'white',
                                                        borderRadius: 100,
                                                        textTransform: 'none',
                                                        '&:hover': {
                                                            backgroundColor: '#FF4778'
                                                        }
                                                    }}
                                                >
                                                    同意
                                                </Button>
                                                <Button
                                                    variant="outlined"
                                                    color="error"
                                                    size="small"
                                                    onClick={() => handleDisagreeRequest(request.id)}
                                                    sx={{ 
                                                        color: COLORS.primary,
                                                        borderColor: COLORS.primary,
                                                        borderRadius: 100,
                                                        textTransform: 'none',
                                                        '&:hover': {
                                                            backgroundColor: 'rgba(255, 94, 135, 0.1)',
                                                            borderColor: '#FF4778'
                                                        }
                                                    }}
                                                >
                                                    拒绝
                                                </Button>
                                            </Box>
                                        )}
                                    </ListItem>
                                    {index < requests.length - 1 && <Divider sx={{ borderColor: COLORS.secondary }} />}
                                </React.Fragment>
                            ))}
                        </List>
                    )}
                </CardContent>
            </Card>

            <BottomNavigationBar />
        </Box>
    );
}

export default BindLoverPage;    