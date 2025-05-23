import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Button,
    Avatar,
    TextField,
    Divider,
    Alert,
    CircularProgress,
    IconButton,
    InputAdornment,
    Stack
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './login/AuthContext';
import BottomNavigationBar from './BottomNavigationBar.jsx';
import Layout from './Layout.jsx';
import baseUrl from './config.js';
import apiRequest from './api.js';
import { Upload, CloudUploadOutlined, CloseOutlined } from '@mui/icons-material';
import { calculateFileHash } from './utils';

// 恋爱记风格配色
const COLORS = {
    primary: '#FF5E87',
    secondary: '#FFB6C1',
    accent: '#FF85A2',
    light: '#FFF0F3',
    dark: '#333333',
    success: '#4CAF50',
    error: '#F44336'
};

function UserInfoPage() {
    const navigate = useNavigate();
    const { user, spouse, loading: authLoading, setUserIconId } = useAuth();
    const [editing, setEditing] = useState(false);
    const [editedUserName, setEditedUserName] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [userAvatarUrl, setUserAvatarUrl] = useState('');
    const [spouseAvatarUrl, setSpouseAvatarUrl] = useState('');
    const [loading, setLoading] = useState(true);
    const [avatarLoading, setAvatarLoading] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');

    useEffect(() => {
        document.title = '我的信息';
        
        if (user) {
            setEditedUserName(user.userName || '');
        
            // 获取用户头像
            if (user.iconId) {
                fetchAvatarUrl(user.iconId, setUserAvatarUrl);
            }
            
            // 获取配偶头像
            if (spouse && spouse.iconId) {
                fetchAvatarUrl(spouse.iconId, setSpouseAvatarUrl);
            }
            
            setLoading(false);
        }
        
    }, [user, spouse, navigate]);

    // 调用下载接口获取头像URL
    const fetchAvatarUrl = async (fileId, setUrl) => {
        setAvatarLoading(true);
        try {
            // 使用apiRequest替代fetch
            const response = await apiRequest(`/aliyun/download`, 'GET', { fileId });
            
            if (response && response.code === '200' && response.data) {
                setUrl(response.data);
            } else {
                console.error('获取头像失败:', response?.message || '未知错误');
                setError('获取头像失败');
            }
        } catch (error) {
            console.error('获取头像请求出错:', error);
            setError('网络请求失败');
        } finally {
            setAvatarLoading(false);
        }
    };

    const handleEdit = () => {
        setEditing(true);
    };

    const handleSave = async () => {
        if (editedUserName.trim() === '') {
            setError('用户名不能为空');
            return;
        }
        
        try {
            setLoading(true);
            // 修正请求参数，应该是userId而不是iconId
            const response = await apiRequest('/update-user-iconId', 'GET', {
                iconId: user.iconId
            });
            
            if (response && response.code === '200') {
                // 更新上下文中的用户信息
               
                setUserIconId(user.iconId);
                
                setEditing(false);
                setSuccess('用户名更新成功');
            } else {
                setError('更新失败，请重试');
            }
        } catch (error) {
            console.error('更新用户信息出错:', error);
            setError('网络请求失败');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setEditedUserName(user.userName || '');
        setEditing(false);
        setSelectedFile(null);
        setPreviewUrl('');
    };

    const handleUnbindLover = async () => {
        if (!spouse) return;
        
        if (window.confirm('确定要解除情侣关系吗？')) {
            try {
                setLoading(true);
                const response = await apiRequest('/unbind-lover', 'POST', {
                    userId: user.userId,
                    loverId: spouse.userId
                });
                
                if (response && response.code === '200') {
                    // 更新上下文中的配偶信息
                    localStorage.removeItem('spouseId');
                    localStorage.removeItem('spouseInfo');
                    
                    setSuccess('已解除情侣关系');
                    
                    // 延迟后跳转到首页
                    setTimeout(() => {
                        navigate('/');
                    }, 1500);
                } else {
                    setError('解除失败，请重试');
                }
            } catch (error) {
                console.error('解除情侣关系出错:', error);
                setError('网络请求失败');
            } finally {
                setLoading(false);
            }
        }
    };

    // 头像上传相关函数
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result);
                setSelectedFile(file);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAvatarUpload = async () => {
        if (!selectedFile) return;
        
        setUploadingAvatar(true);
        setError('');
        setSuccess('');
        
        try {
            // 计算文件哈希
            const hash = await calculateFileHash(selectedFile);
            
            // 检查文件是否已存在
            const existResponse = await apiRequest('/aliyun/fileExist', 'GET', { hash });
            
            let iconId;
            if (existResponse && existResponse.code === '200' && existResponse.data) {
                // 文件已存在，直接使用返回的icon_id
                iconId = existResponse.data;
            } else {
                // 文件不存在，上传文件
                const formData = new FormData();
                formData.append('file', selectedFile);
                
                // 使用apiRequest上传文件
                const uploadResponse = await apiRequest('/aliyun/upload', 'POST', formData);
                
                if (uploadResponse && uploadResponse.code === '200' && uploadResponse.data) {
                    iconId = uploadResponse.data;
                } else {
                    throw new Error('上传失败');
                }
            }
            
            // 更新用户信息
            const updateResponse = await apiRequest('/update-user-iconId', 'GET', {
                iconId: iconId
            });
            
            if (updateResponse && updateResponse.code === '200') {
                setUserIconId(iconId);
                // 更新头像URL
                setUserAvatarUrl(previewUrl);
                setSelectedFile(null);
                setSuccess('头像更新成功');
            } else {
                throw new Error('更新用户信息失败');
            }
        } catch (error) {
            console.error('上传头像出错:', error);
            setError('上传失败，请重试');
        } finally {
            setUploadingAvatar(false);
        }
    };

    // 头像组件
    const UserAvatar = ({ iconId, name, avatarUrl, size = 120, loading = false, editable = false, onEdit, previewUrl, hasPreview }) => {
        const firstChar = name ? name.charAt(0).toUpperCase() : 'U';
        
        return (
            <Box position="relative" display="inline-flex" >
                {loading ? (
                    <Box 
                        sx={{ 
                            width: size, 
                            height: size, 
                            borderRadius: '50%',
                            backgroundColor: '#f0f0f0',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            boxShadow: '0 4px 15px rgba(255, 94, 135, 0.3)'
                        }}
                    >
                        <CircularProgress size={size / 3} color="primary" />
                    </Box>
                ) : (
                    <Avatar 
                        sx={{ 
                            width: size, 
                            height: size, 
                            fontSize: size / 3,
                            boxShadow: '0 4px 15px rgba(255, 94, 135, 0.3)',
                            border: '2px solid white',
                            transition: 'all 0.3s ease'
                        }}
                        src={hasPreview ? previewUrl : avatarUrl}
                    >
                        {!avatarUrl && !previewUrl && firstChar}
                    </Avatar>
                )}
                
                {editable && (
                    <Box 
                        position="absolute" 
                        bottom={0} 
                        right={0} 
                        sx={{
                            backgroundColor: COLORS.primary,
                            color: 'white',
                            borderRadius: '50%',
                            padding: '4px',
                            cursor: 'pointer',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                transform: 'scale(1.1)',
                                backgroundColor: '#FF4778'
                            }
                        }}
                        onClick={onEdit}
                    >
                        <CloudUploadOutlined fontSize="small" />
                    </Box>
                )}
            </Box>
        );
    };

    if (authLoading) {
        return (
            <Layout>
                <Box
                    sx={{
                        minHeight: '100vh',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: COLORS.light
                    }}
                >
                    <CircularProgress color="primary" size={60} />
                </Box>
            </Layout>
        );
    }

    if (!user) {
        navigate('/login');
        return null;
    }

    return (
        <Layout>
            <Box
                sx={{
                    minHeight: '100vh',
                    p: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    backgroundColor: COLORS.light,
                    backgroundImage: 'url("https://picsum.photos/id/1067/1200/800")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundAttachment: 'fixed',
                    position: 'relative',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(255, 240, 243, 0.85)',
                        zIndex: 0
                    }
                }}
            >
                <Box sx={{ width: '100%', maxWidth: 500, zIndex: 1, margin: '5px 0' }}>
                    {error && (
                        <Alert 
                            severity="error" 
                            sx={{ 
                                mb: 4, 
                                borderRadius: 8,
                                backgroundColor: '#FFEBEE',
                                color: COLORS.error,
                                border: `1px solid ${COLORS.error}`,
                                '& .MuiAlert-icon': {
                                    color: COLORS.error
                                }
                            }}
                        >
                            {error}
                        </Alert>
                    )}
                    
                    {success && (
                        <Alert 
                            severity="success" 
                            sx={{ 
                                mb: 4, 
                                borderRadius: 8,
                                backgroundColor: '#E8F5E9',
                                color: COLORS.success,
                                border: `1px solid ${COLORS.success}`,
                                '& .MuiAlert-icon': {
                                    color: COLORS.success
                                }
                            }}
                        >
                            {success}
                        </Alert>
                    )}
                    {/* 用户信息卡片 */}
                    <Card
                        sx={{
                            width: '100%',
                            borderRadius: 6, // 减少圆角半径
                            mb: 6,
                            border: '1px solid rgba(255, 94, 135, 0.1)', // 添加细边框
                            boxShadow: '0 8px 20px rgba(255, 94, 135, 0.1)',
                            transform: 'translateY(0)',
                            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                            '&:hover': {
                                transform: 'translateY(-3px)',
                                boxShadow: '0 12px 25px rgba(255, 94, 135, 0.15)'
                            },
                            backgroundColor: 'white',
                            backgroundImage: `linear-gradient(135deg, ${COLORS.light} 0%, white 70%, ${COLORS.light} 100%)`
                        }}
                    >
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                mb: 4 // 减少底部间距
                            }}
                        >
                            <UserAvatar 
                                iconId={user.iconId}
                                name={user.userName}
                                avatarUrl={userAvatarUrl}
                                loading={avatarLoading && !userAvatarUrl}
                                editable={true}
                                onEdit={() => document.getElementById('avatar-upload').click()}
                                previewUrl={previewUrl}
                                hasPreview={!!previewUrl}
                            />
                            
                            <input
                                type="file"
                                id="avatar-upload"
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={handleFileChange}
                            />
                            
                            {selectedFile && (
                                <Stack direction="row" spacing={2} mt={3} justifyContent="center">
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        startIcon={<Upload />}
                                        onClick={handleAvatarUpload}
                                        disabled={uploadingAvatar}
                                        sx={{
                                            backgroundColor: COLORS.primary,
                                            color: 'white',
                                            borderRadius: 100,
                                            padding: '8px 24px',
                                            textTransform: 'none',
                                            boxShadow: '0 4px 12px rgba(255, 94, 135, 0.2)',
                                            '&:hover': {
                                                backgroundColor: '#FF4778',
                                                boxShadow: '0 6px 16px rgba(255, 94, 135, 0.3)'
                                            },
                                            '&:disabled': {
                                                backgroundColor: `${COLORS.primary}80`,
                                                cursor: 'not-allowed'
                                            }
                                        }}
                                    >
                                        {uploadingAvatar ? '上传中...' : '上传头像'}
                                    </Button>
                                    
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        startIcon={<CloseOutlined />}
                                        onClick={() => {
                                            setSelectedFile(null);
                                            setPreviewUrl('');
                                        }}
                                        sx={{
                                            color: COLORS.primary,
                                            borderColor: COLORS.primary,
                                            borderRadius: 100,
                                            padding: '8px 24px',
                                            textTransform: 'none',
                                            '&:hover': {
                                                borderColor: '#FF4778',
                                                backgroundColor: 'rgba(255, 94, 135, 0.05)'
                                            }
                                        }}
                                    >
                                        取消
                                    </Button>
                                </Stack>
                            )}
                            
                            <Typography variant="h5" gutterBottom sx={{ // 减小标题大小
                                color: COLORS.dark, 
                                fontWeight: 'bold', 
                                mt: 3, // 减少顶部间距
                                textShadow: '1px 1px 3px rgba(0,0,0,0.1)'
                            }}>
                                用户信息
                            </Typography>
                        </Box>
                        
                        <CardContent > {/* 减少顶部内边距 */}
                            <Box mb={2.5}> {/* 减少底部间距 */}
                                <Typography variant="body2" sx={{ mb: 0.5, color: '#666', fontWeight: '500' }}>
                                    用户ID
                                </Typography>
                                <Box 
                                    sx={{
                                        p: 1.5, // 减少内边距
                                        backgroundColor: COLORS.light,
                                        borderRadius: 8, // 减少圆角
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}
                                >
                                    <Typography variant="body1" sx={{ color: COLORS.dark, fontSize: '0.95rem' }}>
                                        {user.userId}
                                    </Typography>
                                </Box>
                            </Box>
                            
                            <Box mb={1}> {/* 减少底部间距 */}
                                <Typography variant="body2" sx={{ mb: 0.5, color: '#666', fontWeight: '500' }}>
                                    用户名
                                </Typography>
                                {editing ? (
                                    <TextField
                                        value={editedUserName}
                                        onChange={(e) => setEditedUserName(e.target.value)}
                                        fullWidth
                                        size="small" // 使用小尺寸输入框
                                        sx={{ 
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 8, // 减少圆角
                                                backgroundColor: COLORS.light,
                                                border: 'none',
                                                '&:hover fieldset': {
                                                    borderColor: COLORS.primary
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: COLORS.primary,
                                                    boxShadow: `0 0 0 2px ${COLORS.primary}30`
                                                }
                                            },
                                            '& .MuiInputLabel-root.Mui-focused': {
                                                color: COLORS.primary
                                            }
                                        }}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        aria-label="清除"
                                                        onClick={() => setEditedUserName('')}
                                                        edge="end"
                                                    >
                                                        <CloseOutlined sx={{ color: '#999' }} />
                                                    </IconButton>
                                                </InputAdornment>
                                            )
                                        }}
                                    />
                                ) : (
                                    <Box 
                                        sx={{
                                            p: 1.5, // 减少内边距
                                            backgroundColor: COLORS.light,
                                            borderRadius: 8, // 减少圆角
                                            display: 'flex',
                                            alignItems: 'center'
                                        }}
                                    >
                                        <Typography variant="body1" sx={{ color: COLORS.dark, fontWeight: 'bold', fontSize: '0.95rem' }}>
                                            {user.userName || user.userId}
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        </CardContent>
                        
                        {editing ? (
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    mt: 3 // 减少顶部间距
                                }}
                            >
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleSave}
                                    sx={{ 
                                        mr: 2,
                                        backgroundColor: COLORS.primary,
                                        color: 'white',
                                        borderRadius: 100,
                                        padding: '8px 28px', // 减少按钮尺寸
                                        textTransform: 'none',
                                        boxShadow: '0 4px 12px rgba(255, 94, 135, 0.2)',
                                        '&:hover': {
                                            backgroundColor: '#FF4778',
                                            boxShadow: '0 6px 16px rgba(255, 94, 135, 0.3)'
                                        }
                                    }}
                                >
                                    保存
                                </Button>
                                <Button
                                    variant="outlined"
                                    onClick={handleCancel}
                                    sx={{ 
                                        color: COLORS.primary,
                                        borderColor: COLORS.primary,
                                        borderRadius: 100,
                                        padding: '8px 28px', // 减少按钮尺寸
                                        textTransform: 'none',
                                        '&:hover': {
                                            borderColor: '#FF4778',
                                            backgroundColor: 'rgba(255, 94, 135, 0.05)'
                                        }
                                    }}
                                >
                                    取消
                                </Button>
                            </Box>
                        ) : (
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleEdit}
                                fullWidth
                                sx={{ 
                                    mt: 3, // 减少顶部间距
                                    backgroundColor: COLORS.primary,
                                    color: 'white',
                                    borderRadius: 100,
                                    padding: '10px 24px', // 减少按钮尺寸
                                    textTransform: 'none',
                                    boxShadow: '0 4px 12px rgba(255, 94, 135, 0.2)',
                                    '&:hover': {
                                        backgroundColor: '#FF4778',
                                        boxShadow: '0 6px 16px rgba(255, 94, 135, 0.3)'
                                    },
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        transform: 'translateY(-2px)'
                                    },
                                    '&:active': {
                                        transform: 'translateY(0)'
                                    }
                                }}
                            >
                                编辑信息
                            </Button>
                        )}
                    </Card>

                    {/* 情侣信息卡片 */}
                    <Card
                        sx={{
                            width: '100%',
                            borderRadius: 6, // 减少圆角半径
                            mb: 6,
                            border: '1px solid rgba(255, 94, 135, 0.1)', // 添加细边框
                            boxShadow: '0 8px 20px rgba(255, 94, 135, 0.1)',
                            transform: 'translateY(0)',
                            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                            '&:hover': {
                                transform: 'translateY(-3px)',
                                boxShadow: '0 12px 25px rgba(255, 94, 135, 0.15)'
                            },
                            backgroundColor: 'white',
                            backgroundImage: `linear-gradient(135deg, ${COLORS.light} 0%, white 70%, ${COLORS.light} 100%)`
                        }}
                    >
                        <Typography variant="h5" gutterBottom sx={{ // 减小标题大小
                            textAlign: 'center', 
                            color: COLORS.dark, 
                            fontWeight: 'bold',
                            textShadow: '1px 1px 3px rgba(0,0,0,0.1)',
                            mt: 1 // 减少顶部间距
                        }}>
                            情侣信息
                        </Typography>
                        <Divider sx={{ my: 2.5, borderColor: `${COLORS.secondary}80` }} /> {/* 减少间距 */}
                        
                        {!spouse ? (
                            <Box
                                sx={{
                                    p: 4, // 减少内边距
                                    textAlign: 'center',
                                    minHeight: 180, // 减少最小高度
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    borderRadius: 10, // 减少圆角
                                    backgroundColor: `${COLORS.light}80`,
                                    border: `1px dashed ${COLORS.secondary}`
                                }}
                            >
                                <Box 
                                    sx={{
                                        width: 70, // 减少尺寸
                                        height: 70, // 减少尺寸
                                        borderRadius: '50%',
                                        backgroundColor: `${COLORS.secondary}30`,
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        mb: 3, // 减少底部间距
                                        animation: '$pulse 2s infinite'
                                    }}
                                >
                                    <i className="fa-regular fa-heart" style={{ fontSize: '1.7rem', color: COLORS.primary }}></i>
                                </Box>
                                
                                <Typography variant="body1" sx={{ mb: 1.5, color: COLORS.dark, fontWeight: 'bold', fontSize: '0.95rem' }}>
                                    你还没有情侣哦
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 4, color: '#666', maxWidth: 250, fontSize: '0.85rem' }}>
                                    绑定情侣解锁更多专属功能，一起记录美好时光
                                </Typography>
                                <Button 
                                    variant="contained" 
                                    color="primary" 
                                    onClick={() => navigate('/bind-lover')}
                                    sx={{
                                        backgroundColor: COLORS.primary,
                                        color: 'white',
                                        borderRadius: 100,
                                        padding: '10px 32px', // 减少按钮尺寸
                                        textTransform: 'none',
                                        boxShadow: '0 4px 12px rgba(255, 94, 135, 0.2)',
                                        '&:hover': {
                                            backgroundColor: '#FF4778',
                                            boxShadow: '0 6px 16px rgba(255, 94, 135, 0.3)'
                                        },
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            transform: 'translateY(-2px)'
                                        },
                                        '&:active': {
                                            transform: 'translateY(0)'
                                        }
                                    }}
                                >
                                    绑定情侣
                                </Button>
                            </Box>
                        ) : (
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}> {/* 减少内边距 */}
                                <UserAvatar 
                                    iconId={spouse.iconId}
                                    name={spouse.userName}
                                    avatarUrl={spouseAvatarUrl}
                                    loading={avatarLoading && !spouseAvatarUrl}
                                    size={100} // 减少头像尺寸
                                />
                                
                                <Box sx={{ mt: 3, width: '100%' }}> {/* 减少顶部间距 */}
                                    <CardContent>
                                    <Box mb={2.5}> {/* 减少底部间距 */}
                                        <Typography variant="body2" sx={{ mb: 0.5, color: '#666', fontWeight: '500' }}>
                                            用户ID
                                        </Typography>
                                        <Box 
                                            sx={{
                                                p: 1.5, // 减少内边距
                                                backgroundColor: COLORS.light,
                                                borderRadius: 8, // 减少圆角
                                                display: 'flex',
                                                alignItems: 'center'
                                            }}
                                        >
                                            <Typography variant="body1" sx={{ color: COLORS.dark, fontSize: '0.95rem' }}>
                                                {spouse.userId}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    
                                    <Box mb={1}> {/* 减少底部间距 */}
                                        <Typography variant="body2" sx={{ mb: 0.5, color: '#666', fontWeight: '500' }}>
                                            情侣昵称
                                        </Typography>
                                        <Box 
                                            sx={{
                                                p: 1.5, // 减少内边距
                                                backgroundColor: COLORS.light,
                                                borderRadius: 8, // 减少圆角
                                                display: 'flex',
                                                alignItems: 'center'
                                            }}
                                        >
                                            <Typography variant="body1" sx={{ color: COLORS.dark, fontWeight: 'bold', fontSize: '0.95rem' }}>
                                                {spouse.userName || spouse.userId}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    </CardContent>
                                </Box>
                                
                        
                               
                                
                                <Button 
                                    variant="outlined" 
                                    color="error" 
                                    onClick={handleUnbindLover}
                                    sx={{ 
                                        mt: 3, // 减少顶部间距
                                        color: COLORS.primary,
                                        borderColor: COLORS.primary,
                                        borderRadius: 100,
                                        padding: '8px 28px', // 减少按钮尺寸
                                        textTransform: 'none',
                                        '&:hover': {
                                            backgroundColor: 'rgba(255, 94, 135, 0.1)',
                                            borderColor: '#FF4778'
                                        },
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            transform: 'translateY(-2px)'
                                        },
                                        '&:active': {
                                            transform: 'translateY(0)'
                                        }
                                    }}
                                >
                                    解除情侣关系
                                </Button>
                            </Box>
                        )}
                    </Card>
                </Box>

                {/* 底部导航栏 */}
                <BottomNavigationBar />
            </Box>
        </Layout>
    );
}

export default UserInfoPage;
