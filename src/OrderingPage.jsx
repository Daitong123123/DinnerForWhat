import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Button,
    List,
    ListItem,
    ListItemText,
    Divider,
    TextField,
    Grid,
    IconButton
} from '@mui/material';
import { Add, Remove } from '@mui/icons-material';
import apiRequest from './api'; // 假设 apiRequest 函数在 api.js 文件中
import { useNavigate } from 'react-router-dom'; // 假设使用了 react-router-dom

const OrderingPage = () => {
    const [cart, setCart] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [dishes, setDishes] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDishes = async () => {
            const formData = {
                curPage: 1,
                pageSize: 1000,
                complex: "",
                dishFrom: "",
                tasty: ""
            };
            try {
                const response = await apiRequest('/query-likes', 'POST', formData, navigate);
                if (response) {
                    const { cookBookLikesList } = response;
                    const formattedDishes = cookBookLikesList.map(dish => ({
                        id: dish.id,
                        name: dish.dishName,
                        cuisine: dish.dishFrom,
                        flavor: dish.tasty,
                        slackerValue: dish.complex * 20,
                        cost: dish.dishCost,
                        description: `复杂度: ${dish.complex}，功效: ${dish.dishEffect}，食材: ${dish.dishIngredients}`
                    }));
                    setDishes(formattedDishes);
                } else {
                    console.error('获取收藏列表失败');
                }
            } catch (error) {
                console.error('请求出错:', error);
            }
        };

        fetchDishes();
    }, [navigate]);

    const addToCart = (dish) => {
        const existingItem = cart.find(item => item.id === dish.id);
        if (existingItem) {
            setCart(cart.map(item =>
                item.id === dish.id ? { ...item, quantity: item.quantity + 1 } : item
            ));
        } else {
            setCart([...cart, { ...dish, quantity: 1 }]);
        }
    };

    const removeFromCart = (dish) => {
        const existingItem = cart.find(item => item.id === dish.id);
        if (existingItem) {
            if (existingItem.quantity === 1) {
                setCart(cart.filter(item => item.id !== dish.id));
            } else {
                setCart(cart.map(item =>
                    item.id === dish.id ? { ...item, quantity: item.quantity - 1 } : item
                ));
            }
        }
    };

    const getQuantity = (dishId) => {
        const item = cart.find(item => item.id === dishId);
        return item ? item.quantity : 0;
    };

    const filteredDishes = dishes.filter(dish =>
        dish.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalSlackerValue = cart.reduce((total, item) => total + item.slackerValue * item.quantity, 0);

    return (
        <Box sx={{ padding: 4, backgroundColor: '#f9f9f9' }}>
            <Typography variant="h4" sx={{ textAlign: 'center', marginBottom: 4, color: '#333' }}>
                美味餐厅点菜
            </Typography>
            <TextField
                label="搜索菜品"
                variant="outlined"
                fullWidth
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ marginBottom: 4 }}
            />
            <Grid container spacing={3}>
                {filteredDishes.map((dish) => (
                    <Grid
                        item
                        xs={12}
                        sm={6}
                        md={4}
                        key={dish.id}
                        sx={{
                            // 手机端一行一个菜，网页端一行多个菜
                            '@media (max-width: 600px)': {
                                flexBasis: '100%',
                                maxWidth: '100%'
                            }
                        }}
                    >
                        <Card sx={{ borderRadius: 10, boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', height: '100%', position: 'relative' }}>
                            <CardContent sx={{ height: 180, overflowY: 'auto', paddingBottom: 5, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                <div>
                                    <Typography variant="h6" component="div" sx={{ wordWrap: 'break-word', wordBreak: 'break-all', maxWidth: '30ch' }}>
                                        {dish.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ wordWrap: 'break-word', wordBreak: 'break-all', maxWidth: '30ch' }}>
                                        菜系: {dish.cuisine}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ wordWrap: 'break-word', wordBreak: 'break-all', maxWidth: '30ch' }}>
                                        口味: {dish.flavor}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ wordWrap: 'break-word', wordBreak: 'break-all', maxWidth: '30ch' }}>
                                        花费参考: {dish.cost}
                                    </Typography>
                                </div>
                                <Typography variant="subtitle1" sx={{ wordWrap: 'break-word', wordBreak: 'break-all', maxWidth: '30ch', textAlign: 'center' }}>
                                    不劳而获值: {dish.slackerValue}
                                </Typography>
                            </CardContent>
                            <div style={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center' }}>
                                {getQuantity(dish.id) === 0 ? (
                                    <IconButton onClick={() => addToCart(dish)} size="small" color="primary">
                                        <Add />
                                    </IconButton>
                                ) : (
                                    <>
                                        <IconButton onClick={() => removeFromCart(dish)} size="small" color="secondary">
                                            <Remove />
                                        </IconButton>
                                        <Typography sx={{ margin: '0 8px' }}>{getQuantity(dish.id)}</Typography>
                                        <IconButton onClick={() => addToCart(dish)} size="small" color="primary">
                                            <Add />
                                        </IconButton>
                                    </>
                                )}
                            </div>
                        </Card>
                    </Grid>
                ))}
            </Grid>
            <Divider sx={{ margin: '40px 0' }} />
            <Box sx={{ backgroundColor: '#fff', padding: 3, borderRadius: 10, boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
                <Typography variant="h5" sx={{ marginBottom: 2, color: '#333' }}>
                    购物车
                </Typography>
                <List>
                    {cart.map((item) => (
                        <ListItem key={item.id}>
                            <ListItemText primary={item.name} secondary={`不劳而获值: ${item.slackerValue} x ${item.quantity}`} />
                            <IconButton onClick={() => removeFromCart(item)} size="small" color="secondary">
                                <Remove />
                            </IconButton>
                            <Typography sx={{ margin: '0 8px' }}>{item.quantity}</Typography>
                            <IconButton onClick={() => addToCart(item)} size="small" color="primary">
                                <Add />
                            </IconButton>
                        </ListItem>
                    ))}
                </List>
                <Typography variant="h6" sx={{ marginTop: 2, color: '#333' }}>
                    总计不劳而获值: {totalSlackerValue}
                </Typography>
                <Button
                    variant="contained"
                    color="success"
                    fullWidth
                    sx={{ marginTop: 4, borderRadius: 20 }}
                >
                    结算
                </Button>
            </Box>
        </Box>
    );
};

export default OrderingPage;    