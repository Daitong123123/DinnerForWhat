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

function BindLoverPage() {
    const navigate = useNavigate();
    const [userId, setUserId] = useState('');
    const [loverId, setLoverId] = useState('');
    const [message, setMessage] = useState('');
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [userNicknames, setUserNicknames] = useState({});

    useEffect(() => {
        document.title = '绑定情侣';
        const storedUserId = localStorage.getItem('userId');
        if (storedUserId) {
            setUserId(storedUserId);
            fetchRequests(storedUserId);
        } else {
            navigate('/login');
        }
    }, [navigate]);

    // 获取用户昵称
    const fetchUserNickname = async (userId) => {
        try {
            const response = await apiRequest('/friend-info', 'GET', { userId });
            if (response && response.userNickName) {
                setUserNicknames(prev => ({
                    ...prev,
                    [userId]: response.userNickName
                }));
                return response.userNickName;
            }
            return userId; // 如果获取失败则显示ID
        } catch (error) {
            console.error('获取用户昵称出错:', error);
            return userId; // 出错时显示ID
        }
    };

    const fetchRequests = async (userId) => {
        try {
            setLoading(true);
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
                
                const allRequests = [...receivedRequests, ...sentRequests];
                setRequests(allRequests);
                
                // 批量获取用户昵称
                const uniqueIds = [...new Set(allRequests.map(req => req.id))];
                uniqueIds.forEach(id => {
                    if (!userNicknames[id]) {
                        fetchUserNickname(id);
                    }
                });
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
            setMessage('');
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

    // 获取用户昵称，没有则显示ID
    const getNickname = (id) => userNicknames[id] || id;

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
            <Typography variant="h4" gutterBottom sx={{ mt: 2, mb: 4, fontWeight: 'bold' }}>
                情侣绑定
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 4, width: '100%', maxWidth: 500 }}>
                    {error}
                </Alert>
            )}
            
            {success && (
                <Alert severity="success" sx={{ mb: 4, width: '100%', maxWidth: 500 }}>
                    {success}
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
                    border: '1px solid #ccc',
                    mb: 4
                }}
            >
                <Typography variant="h5" gutterBottom>
                    发送情侣申请
                </Typography>
                <Divider sx={{ my: 2 }} />
                <CardContent>
                    <TextField
                        label="对方ID"
                        type="text"
                        value={loverId}
                        onChange={(e) => setLoverId(e.target.value)}
                        fullWidth
                        sx={{ mb: 3 }}
                    />
                    <TextField
                        label="附言（选填）"
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        fullWidth
                        sx={{ mb: 3 }}
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSubmitRequest}
                        fullWidth
                        disabled={loading}
                        sx={{ mt: 2 }}
                    >
                        {loading ? <CircularProgress size={24} /> : '发送申请'}
                    </Button>
                </CardContent>
            </Card>

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
                <Typography variant="h5" gutterBottom>
                    申请管理
                </Typography>
                <Divider sx={{ my: 2 }} />
                <CardContent>
                    {loading && (
                        <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
                            <CircularProgress />
                        </Box>
                    )}
                    {!loading && requests.length === 0 && (
                        <Box sx={{ py: 6, textAlign: 'center' }}>
                            <Typography color="text.secondary">暂无待处理的情侣申请</Typography>
                        </Box>
                    )}
                    {requests.length > 0 && (
                        <List>
                            {requests.map((request, index) => (
                                <React.Fragment key={request.id}>
                                    <ListItem alignItems="flex-start">
                                        <ListItemAvatar>
                                            <Avatar>{getNickname(request.id).charAt(0).toUpperCase()}</Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={getNickname(request.id)}
                                            secondary={
                                                <React.Fragment>
                                                    <Typography
                                                        sx={{ display: 'inline' }}
                                                        component="span"
                                                        variant="body2"
                                                        color="text.primary"
                                                    >
                                                        {request.type === 'received' 
                                                            ? `${getNickname(request.id)}请求和你成为情侣` 
                                                            : `你已向${getNickname(request.id)}发送情侣申请`}
                                                    </Typography>
                                                    {request.content && (
                                                        <Typography
                                                            sx={{ display: 'block', mt: 1 }}
                                                            component="span"
                                                            variant="body2"
                                                            color="text.secondary"
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
                                                    color="success"
                                                    size="small"
                                                    onClick={() => handleAgreeRequest(request.id)}
                                                    sx={{ mb: 1 }}
                                                >
                                                    同意
                                                </Button>
                                                <Button
                                                    variant="outlined"
                                                    color="error"
                                                    size="small"
                                                    onClick={() => handleDisagreeRequest(request.id)}
                                                >
                                                    拒绝
                                                </Button>
                                            </Box>
                                        )}
                                    </ListItem>
                                    {index < requests.length - 1 && <Divider />}
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