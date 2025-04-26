import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Card,
    Button,
    TextField,
    Select,
    MenuItem,
    InputLabel,
    FormControl,
    Avatar,
    Menu,
    Stack,
    Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import apiRequest from './api.js';
import BottomNavigationBar from './BottomNavigationBar.jsx';

const DishPage = () => {
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
    const [userNickName, setUserNickName] = useState('');
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
            } else {
                navigate('/');
            }
        };
        checkLogin();
    }, [navigate]);

    useEffect(() => {
        const storedUserId = localStorage.getItem('userId');
        if (storedUserId) {
            const fetchUserNickName = async () => {
                try {
                    const response = await apiRequest(`/friend-info?userId=${storedUserId}`, 'GET', null, navigate);
                    if (response) {
                        setUserNickName(response.userNickName || response.userName);
                    }
                } catch (error) {
                    console.error('获取用户昵称失败', error);
                }
            };
            fetchUserNickName();
        }
    }, [navigate]);

    useEffect(() => {
        const savedDishes = localStorage.getItem('dishes');
        if (savedDishes) {
            setDishes(JSON.parse(savedDishes));
        }
    }, []);

    useEffect(() => {
        if (dishes.length > 0) {
            localStorage.setItem('dishes', JSON.stringify(dishes));
        }
    }, [dishes]);

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

        const formData = {
            dishType,
            dishNumber,
            dishTaste,
            preference,
            complexStart: parseInt(complexStart, 10),
            complexEnd: parseInt(complexEnd, 10)
        };

        try {
            const response = await apiRequest('/dish', 'POST', formData, navigate);
            if (response) {
                const dishesWithLikeStatus = await Promise.all(response.data.map(async dish => {
                    const likeResponse = await apiRequest(`/isLike?dishId=${dish.id}`, 'GET', null, navigate);
                    return {
                        ...dish,
                        isLiked: likeResponse?.data === true
                    };
                }));
                setDishes(dishesWithLikeStatus);
            } else {
                setError(response.message || '请求失败');
            }
        } catch (error) {
            console.error('请求出错:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUnlike = async (dishId) => {
        try {
            const response = await apiRequest('/unlike', 'POST', {
                "unlikes": [dishId]
            }, navigate);

            if (response) {
                setDishes(dishes.filter(dish => dish.id!== dishId));
            } else {
                console.error('取消喜欢失败');
            }
        } catch (error) {
            console.error('取消喜欢请求出错:', error);
        }
    };

    const handleLike = async (dish) => {
        const formData = {
            dishId: dish.id
        };

        try {
            const response = await apiRequest('/add-like', 'POST', formData, navigate);
            if (response) {
                setDishes(dishes.map(item =>
                    item.dishName === dish.dishName? {...item, isLiked: true } : item
                ));
                console.log('收藏成功');
            } else {
                console.error('收藏失败');
            }
        } catch (error) {
            console.error('收藏请求出错:', error);
        }
    };

    const handleUnLikeDelete = async (dishId) => {
        try {
            
            const response = await apiRequest('/delete-likes', 'POST', [dishId], navigate);
            if (response) {
                setDishes(dishes.map(dish => 
                    dish.id === dishId ? {...dish, isLiked: false} : dish
                ));
                console.log('取消收藏成功');
            } else {
                console.error('取消收藏失败');
            }
        } catch (error) {
            console.error('取消收藏请求出错:', error);
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
            {user && (
                <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="flex-start"
                    width="100%"
                    mb={2}
                >
                    <Avatar onClick={handleClick} src={user.avatarUrl || ''} />
                    <Typography sx={{ ml: 1, color: 'black', fontSize: '12px' }}>
                        {userNickName}，你好
                    </Typography>
                    <Menu
                        id="simple-menu"
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleClose}
                    >
                        <MenuItem onClick={handleLogout}>退出</MenuItem>
                    </Menu>
                </Stack>
            )}
            <Card
                sx={{
                    p: 3,
                    width: '100%',
                    maxWidth: 600,
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                    backgroundColor: '#fff',
                    borderRadius: 10,
                    overflow: 'hidden',
                    '@media (max-width: 600px)': {
                        p: 2,
                        maxWidth: '90%'
                    }
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
                    菜品推荐
                </Typography>
                <Stack spacing={2}>
                    <FormControl fullWidth>
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
                        InputProps={{
                            sx: { color: '#333' }
                        }}
                        InputLabelProps={{
                            sx: { color: '#666' }
                        }}
                    />
                    <FormControl fullWidth>
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
                            <MenuItem value="河北菜">河北菜</MenuItem>
                            <MenuItem value="山西菜">山西菜</MenuItem>
                            <MenuItem value="辽宁菜">辽宁菜</MenuItem>
                            <MenuItem value="吉林菜">吉林菜</MenuItem>
                            <MenuItem value="黑龙江菜">黑龙江菜</MenuItem>
                            <MenuItem value="浙江菜">浙江菜</MenuItem>
                            <MenuItem value="安徽菜">安徽菜</MenuItem>
                            <MenuItem value="河南菜">河南菜</MenuItem>
                            <MenuItem value="海南菜">海南菜</MenuItem>
                            <MenuItem value="重庆菜">重庆菜</MenuItem>
                            <MenuItem value="贵州菜">贵州菜</MenuItem>
                            <MenuItem value="陕西菜">陕西菜</MenuItem>
                            <MenuItem value="甘肃菜">甘肃菜</MenuItem>
                            <MenuItem value="青海菜">青海菜</MenuItem>
                            <MenuItem value="台湾菜">台湾菜</MenuItem>
                            <MenuItem value="内蒙古菜">内蒙古菜</MenuItem>
                            <MenuItem value="西藏菜">西藏菜</MenuItem>
                            <MenuItem value="宁夏菜">宁夏菜</MenuItem>
                            <MenuItem value="新疆菜">新疆菜</MenuItem>
                            <MenuItem value="香港菜">香港菜</MenuItem>
                            <MenuItem value="澳门菜">澳门菜</MenuItem>
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
                    <FormControl fullWidth>
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
                    <Stack direction="row" alignItems="center" gap={1}>
                        <TextField
                            label="菜品制作难度（起始）"
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
                            label="菜品制作难度（终止）"
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
                    </Stack>
                </Stack>
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
                        },
                        mt: 3
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
                <Divider sx={{ my: 3 }} />
                {dishes.length > 0 && (
                    <Stack spacing={2}>
                        {dishes.map((dish, index) => (
                            <Card
                                key={index}
                                sx={{
                                    p: 2,
                                    background: '#f9f9f9',
                                    borderRadius: 8,
                                    border: '1px solid #ccc',
                                    transition: 'box-shadow 0.3s',
                                    '&:hover': {
                                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                                    },
                                    '@media (max-width: 600px)': {
                                        width: '100%'
                                    }
                                }}
                            >
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
                                    <span style={{ color: 'green' }}>功效:</span> {dish.dishEffect}
                                </Typography>
                                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mb: 1 }}>
                                    <span style={{ color: 'brown' }}>食材:</span> {dish.dishIngredients}
                                </Typography>
                                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mb: 1 }}>
                                    <span style={{ color: 'orange' }}>花费:</span> {dish.dishCost}
                                </Typography>
                                <Stack direction="row" spacing={1}>
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        onClick={() => handleUnlike(dish.id)}
                                    >
                                        不喜欢
                                    </Button>
                                    {dish.isLiked? (
                                        <Button
                                            variant="outlined"
                                            color="secondary"
                                            onClick={() => handleUnLikeDelete(dish.id)}
                                        >
                                            取消收藏
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="outlined"
                                            color="primary"
                                            onClick={() => handleLike(dish)}
                                        >
                                            收藏
                                        </Button>
                                    )}
                                </Stack>
                            </Card>
                        ))}
                    </Stack>
                )}
            </Card>
            <BottomNavigationBar />
        </Box>
    );
};

export default DishPage;