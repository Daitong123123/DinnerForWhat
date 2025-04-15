import React, { useState, useEffect } from'react';
import { Box, Typography, Card, CardContent, Button, TextField, Select, MenuItem, InputLabel, FormControl, Avatar, Menu, MenuItem as MuiMenuItem } from '@mui/material';
import { useNavigate } from'react-router-dom';
import apiRequest from './api.js';

function DishPage() {
    const [dishType, setDishType] = useState('晚餐');
    const [dishNumber, setDishNumber] = useState('3');
    const [dishTaste, setDishTaste] = useState('四川菜');
    const [preference, setPreference] = useState('特辣');
    const [complexStart, setComplexStart] = useState('1');
    const [complexEnd, setComplexEnd] = useState('3');
    const [dishes, setDishes] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null); 
    const [anchorEl, setAnchorEl] = useState(null); 
    const navigate = useNavigate();

    const handleLogout = () => {
        document.cookie = "sessionId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        setUser(null);
        navigate('/'); 
    };

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    useEffect(() => {
        const checkLogin = () => {
            const cookie = document.cookie.match(/(?:^|;\s*)sessionId=([^;]+)/);
            if (cookie) {
                const sessionId = cookie[1];
                setUser({ sessionId });
                console.log('获取到的 sessionId:', sessionId);
            } else {
                console.log('未获取到 sessionId，跳转到登录页');
                navigate('/');
            }
        };
        checkLogin();
    }, [navigate]);

    const handleSubmit = async () => {
        if (!dishNumber || isNaN(parseInt(dishNumber, 10)) || parseInt(dishNumber, 10) > 100 || parseInt(dishNumber, 10) < 1) {
            setError('请输入1到100之间的正整数作为菜的数量');
            return;
        }
        if (complexStart!== '' && complexEnd!== '' && parseInt(complexEnd, 10) < parseInt(complexStart, 10)) {
            setError('第二个复杂度值必须大于或等于第一个复杂度值');
            return;
        }
        setLoading(true);
        setError('');
        let complex = '';
        if (complexStart!== '' && complexEnd!== '') {
            if (complexStart === complexEnd) {
                complex = `${complexStart}星`;
            } else {
                complex = `${complexStart}到${complexEnd}星`;
            }
        } else if (complexStart!== '') {
            complex = `${complexStart}星及以上`;
        } else if (complexEnd!== '') {
            complex = `低于${complexEnd}星`;
        }
        const formData = {
            dishType,
            dishNumber,
            dishTaste,
            preference,
            complex
        };

        try {
            const response = await apiRequest('/dish', 'POST', formData, navigate);
            if (response) {
                setDishes(response.data);
            } else {
                setError(response.message || '请求失败');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleUnlike = async (dishName) => {
        try {
            const response = await apiRequest('/unlike', 'POST', {
                "unlikes": [dishName]
            }, navigate);

            if (response) {
                setDishes(dishes.filter(dish => dish.dishName!== dishName));
            } else {
                console.error('取消喜欢失败');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const renderStars = (complex) => {
        const stars = [];
        for (let i = 0; i < 10; i++) {
            if (i < parseInt(complex, 10)) {
                stars.push(<span key={i} style={{ color: '#FFD700' }}>★</span>);
            } else {
                stars.push(<span key={i} style={{ color: '#ccc' }}>☆</span>);
            }
        }
        return stars;
    };

    useEffect(() => {
        document.title = '今天吃什么';
    }, []);

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
            {user && (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', width: '100%', mb: 2 }}>
                    <Avatar onClick={handleClick} src={user.avatarUrl || ''} />
                    <Typography sx={{ ml: 1 }}>{user.nickname || ''}</Typography>
                    <Typography sx={{ ml: 1, color: 'green', fontSize: '12px' }}>已登录</Typography>
                    <Menu
                        id="simple-menu"
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleClose}
                    >
                        <MuiMenuItem onClick={handleLogout}>退出</MuiMenuItem>
                    </Menu>
                </Box>
            )}
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
                    菜品推荐
                </Typography>
                <FormControl fullWidth sx={{ mb: 3 }}>
                    <InputLabel sx={{ color: '#666' }}>用餐类型</InputLabel>
                    <Select
                        value={dishType}
                        onChange={(e) => setDishType(e.target.value)}
                        label="用餐类型"
                        sx={{ color: '#333' }}
                    >
                        <MenuItem value="晚餐">晚餐</MenuItem>
                        <MenuItem value="午餐">午餐</MenuItem>
                    </Select>
                </FormControl>
                <TextField
                    label="菜的数量"
                    type="number"
                    value={dishNumber}
                    onChange={(e) => setDishNumber(e.target.value)}
                    fullWidth
                    sx={{ mb: 3 }}
                    InputProps={{
                        sx: { color: '#333' }
                    }}
                    InputLabelProps={{
                        sx: { color: '#666' }
                    }}
                />
                <FormControl fullWidth sx={{ mb: 3 }}>
                    <InputLabel sx={{ color: '#666' }}>菜系</InputLabel>
                    <Select
                        value={dishTaste}
                        onChange={(e) => setDishTaste(e.target.value)}
                        label="菜系"
                        sx={{ color: '#333' }}
                    >
                        <MenuItem value="四川菜">四川菜</MenuItem>
                        <MenuItem value="广东菜">广东菜</MenuItem>
                        <MenuItem value="福建菜">福建菜</MenuItem>
                        <MenuItem value="江苏菜">江苏菜</MenuItem>
                        <MenuItem value="湖北菜">湖北菜</MenuItem>
                        <MenuItem value="江西菜">江西菜</MenuItem>
                        <MenuItem value="东北菜">东北菜</MenuItem>
                        <MenuItem value="山东菜">山东菜</MenuItem>
                        <MenuItem value="广西菜">广西菜</MenuItem>
                        <MenuItem value="湖南菜">湖南菜</MenuItem>
                        <MenuItem value="北京菜">北京菜</MenuItem>
                        <MenuItem value="上海菜">上海菜</MenuItem>
                        <MenuItem value="云南菜">云南菜</MenuItem>
                        <MenuItem value="法国菜">法国菜</MenuItem>
                        <MenuItem value="美国菜">美国菜</MenuItem>
                        <MenuItem value="泰国菜">泰国菜</MenuItem>
                        <MenuItem value="日本菜">日本菜</MenuItem>
                        <MenuItem value="英国菜">英国菜</MenuItem>
                        <MenuItem value="动画片里出现的菜">动画片</MenuItem>
                        <MenuItem value="游戏里里出现的菜">游戏</MenuItem>
                        <MenuItem value="游戏怪物猎人(Monster Hunter)里出现的菜">怪物猎人</MenuItem>
                        <MenuItem value="游戏饥荒（Dont Starve Together）里出现的菜">饥荒</MenuItem>
                    </Select>
                </FormControl>
                <FormControl fullWidth sx={{ mb: 3 }}>
                    <InputLabel sx={{ color: '#666' }}>口味偏好</InputLabel>
                    <Select
                        value={preference}
                        onChange={(e) => setPreference(e.target.value)}
                        label="口味偏好"
                        sx={{ color: '#333' }}
                    >
                        <MenuItem value="微辣">微辣</MenuItem>
                        <MenuItem value="特辣">特辣</MenuItem>
                        <MenuItem value="麻辣">麻辣</MenuItem>
                        <MenuItem value="酸辣">酸辣</MenuItem>
                        <MenuItem value="微甜">微甜</MenuItem>
                        <MenuItem value="甜">甜</MenuItem>
                        <MenuItem value="甜辣">甜辣</MenuItem>
                        <MenuItem value="香辣">香辣</MenuItem>
                        <MenuItem value="清淡">清淡</MenuItem>
                    </Select>
                </FormControl>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                    <TextField
                        label="菜品制作难度"
                        placeholder="菜品制作难度"
                        type="number"
                        value={complexStart}
                        onChange={(e) => setComplexStart(e.target.value)}
                        fullWidth
                        InputProps={{
                            sx: { color: '#333' }
                        }}
                        InputLabelProps={{
                            sx: { color: '#666' }
                        }}
                    />
                    <Typography sx={{ color: '#666' }}>-</Typography>
                    <TextField
                        label="菜品制作难度"
                        placeholder="菜品制作难度"
                        type="number"
                        value={complexEnd}
                        onChange={(e) => setComplexEnd(e.target.value)}
                        fullWidth
                        InputProps={{
                            sx: { color: '#333' }
                        }}
                        InputLabelProps={{
                            sx: { color: '#666' }
                        }}
                    />
                </Box>
                <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={loading || dishNumber === ''}
                    fullWidth
                    sx={{
                        background: 'linear-gradient(45deg, #FF6F61, #FFB142)',
                        '&:hover': {
                            background: 'linear-gradient(45deg, #FFB142, #FF6F61)'
                        },
                        '&:disabled': {
                            background: '#ccc'
                        }
                    }}
                >
                    {loading? '请求中...' : '获取菜品'}
                </Button>
                <Button
                    variant="outlined"
                    onClick={() => navigate('/unlike')}
                    sx={{ mt: 2 }}
                >
                    管理我的菜品
                </Button>
                {error && (
                    <Typography color="error" align="center" sx={{ mt: 2 }}>
                        {error}
                    </Typography>
                )}
                {dishes.length > 0 && (
                    <Box sx={{ mt: 4 }}>
                        {dishes.map((dish, index) => (
                            <Card key={index} sx={{ mb: 2, p: 2, background: '#f9f9f9', borderRadius: 8, border: '1px solid #ccc' }}>
                                <Typography variant="h6" sx={{ mb: 1 }}>
                                    {dish.dishName}
                                </Typography>
                                <Typography variant="caption" sx={{ mb: 1, color: '#666' }}>
                                    复杂度: {renderStars(parseInt(dish.complex, 10))}
                                </Typography>
                                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                    {dish.dishStep}
                                </Typography>
                                <hr style={{ border: '0.5px solid #ccc', margin: '10px 0' }} />
                                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mb: 1 }}>
                                    功效: {dish.dishEffect}
                                </Typography>
                                <Button
                                    variant="outlined"
                                    color="error"
                                    onClick={() => handleUnlike(dish.dishName)}
                                >
                                    不喜欢
                                </Button>
                            </Card>
                        ))}
                    </Box>
                )}
            </Card>
        </Box>
    );
}

export default DishPage;