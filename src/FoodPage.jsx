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
import DishPage from './DishPage';
import OrderingPage from './OrderingPage';
import UnlikePage from './UnlikePage';
import Layout from './Layout';

// 恋爱记风格配色
const COLORS = {
    primary: '#FF5E87',
    secondary: '#FFB6C1',
    accent: '#FF85A2',
    light: '#FFF0F3',
    dark: '#333333'
};

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
            case '/order':
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
                <CircularProgress color="primary" />
            </Box>
        );
    }

    return (
        <Layout>
            <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                {/* 顶部导航栏 */}
                <AppBar position="static" color="transparent" sx={{ boxShadow: 'none' }}>
                    <Toolbar sx={{ backgroundColor: '#fff', borderRadius: '0 0 16px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                        <Typography variant="h5" component="div" sx={{ flexGrow: 1, color: COLORS.primary, fontWeight: 'bold' }}>
                            干饭中心
                        </Typography>
                    </Toolbar>
                    <Tabs
                        value={value}
                        onChange={handleChange}
                        variant="fullWidth"
                        textColor={COLORS.primary}
                        indicatorColor={COLORS.primary}
                        sx={{ backgroundColor: '#fff', '& .MuiTabs-indicator': { height: '3px' } }}
                    >
                        <Tab label="菜谱" sx={{ textTransform: 'none', fontWeight: value === 0 ? 'bold' : 'normal' }} />
                        <Tab label="餐厅" sx={{ textTransform: 'none', fontWeight: value === 1 ? 'bold' : 'normal' }} />
                        <Tab label="喜好" sx={{ textTransform: 'none', fontWeight: value === 2 ? 'bold' : 'normal' }} />
                    </Tabs>
                </AppBar>

                {/* 根据选中的标签显示对应的内容 */}
                <Box sx={{ flexGrow: 1, p: 2, pb: 10, backgroundColor: COLORS.light }}>
                    {value === 0 && <DishPage />}
                    {value === 1 && <OrderingPage />}
                    {value === 2 && <UnlikePage />}
                </Box>
            </Box>
        </Layout>
    );
}

export default FoodPage;    