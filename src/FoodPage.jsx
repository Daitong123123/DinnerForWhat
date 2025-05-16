// FoodPage.jsx
import React, { useState, useEffect } from 'react';
import {
    Box,
    AppBar,
    Toolbar,
    Tabs,
    Tab,
    Typography,
    CircularProgress
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import DishPage from './DishPage'; // 假设这是您的菜谱页面组件
import OrderingPage from './OrderingPage'; // 假设这是您的餐厅点菜页面组件
import UnlikePage from './UnlikePage'; // 假设这是您的喜好管理页面组件
import BottomNavigationBar from './BottomNavigationBar';
import Layout from './Layout';

function FoodPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [value, setValue] = useState(0);
    const [loading, setLoading] = useState(true);

    // 根据当前路径设置选中的标签
    useEffect(() => {
        switch (location.pathname) {
            case '/dish':
                setValue(0);
                break;
            case '/ordering':
                setValue(1);
                break;
            case '/unlike':
                setValue(2);
                break;
            default:
                setValue(0);
        }
        setLoading(false);
    }, [location.pathname]);

    // 处理标签切换
    const handleChange = (event, newValue) => {
        setValue(newValue);
        // 根据选中的标签导航到对应的路径
        switch (newValue) {
            case 0:
                navigate('/dish');
                break;
            case 1:
                navigate('/order');
                break;
            case 2:
                navigate('/unlike');
                break;
            default:
                navigate('/dish');
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Layout>
            <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                {/* 顶部导航栏 */}
                <AppBar position="static" color="primary">
                    <Toolbar>
                        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                            干饭中心
                        </Typography>
                    </Toolbar>
                    <Tabs
                        value={value}
                        onChange={handleChange}
                        variant="fullWidth"
                        textColor="inherit"
                        indicatorColor="secondary"
                    >
                        <Tab label="菜谱" />
                        <Tab label="餐厅" />
                        <Tab label="喜好" />
                    </Tabs>
                </AppBar>

                {/* 根据选中的标签显示对应的内容 */}
                <Box sx={{ flexGrow: 1, p: 2, pb: 10 }}> {/* 底部留出空间给底部导航栏 */}
                    {value === 0 && <DishPage />}
                    {value === 1 && <OrderingPage />}
                    {value === 2 && <UnlikePage />}
                </Box>
            </Box>
        </Layout>
    );
}

export default FoodPage;