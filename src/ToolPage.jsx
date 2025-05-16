import React from 'react';
import { Grid, Typography, Box, Card, CardContent, CardMedia, AppBar, Toolbar, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import BottomNavigationBar from './BottomNavigationBar.jsx';
import Layout from './Layout.jsx';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import { styled } from '@mui/system';

// 恋爱记风格配色
const COLORS = {
    primary: '#FF5E87',
    secondary: '#FFB6C1',
    accent: '#FF85A2',
    light: '#FFF0F3',
    dark: '#333333',
    lightPink: '#FFF9FA',
};

// 自定义卡片样式
const StyledCard = styled(Card)(({ theme }) => ({
    width: '100%',
    borderRadius: '1.25rem',
    border: 'none',
    boxShadow: '0 4px 15px rgba(255, 94, 135, 0.08)',
    transition: 'all 0.3s ease',
    backgroundColor: 'white',
    '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: '0 8px 25px rgba(255, 94, 135, 0.15)',
    },
    '&:active': {
        transform: 'translateY(-2px)',
    }
}));

// 自定义卡片媒体区域
const StyledCardMedia = styled(CardMedia)(({ theme }) => ({
    height: '120px',
    borderTopLeftRadius: '1.25rem',
    borderTopRightRadius: '1.25rem',
    position: 'relative',
    overflow: 'hidden',
    '&:after': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.2) 100%)',
        pointerEvents: 'none',
    }
}));

function ToolPage() {
    const navigate = useNavigate();

    // 工具列表数据
    const tools = [
        {
            id: 1,
            name: '翻译',
            iconUrl: 'https://picsum.photos/seed/translate/200/200',
            onClick: () => navigate('/tool/translate'),
            color: '#FF85A2'
        },
        {
            id: 2,
            name: '小星星',
            iconUrl: 'https://picsum.photos/seed/star/200/200',
            onClick: () => navigate('/tool/star-game'),
            color: '#FFB6C1'
        },
        {
            id: 3,
            name: '纪念日',
            iconUrl: 'https://picsum.photos/seed/anniversary/200/200',
            onClick: () => navigate('/tool/anniversary'),
            color: '#FF5E87'
        },
        {
            id: 4,
            name: '相册',
            iconUrl: 'https://picsum.photos/seed/album/200/200',
            onClick: () => navigate('/tool/album'),
            color: '#FFA07A'
        },
        {
            id: 5,
            name: '日历',
            iconUrl: 'https://picsum.photos/seed/calendar/200/200',
            onClick: () => navigate('/tool/calendar'),
            color: '#FFC0CB'
        },
        {
            id: 6,
            name: '更多',
            iconUrl: 'https://picsum.photos/seed/more/200/200',
            onClick: () => navigate('/tool/more'),
            color: '#FF69B4'
        }
    ];

    return (
        <Layout>
            {/* 顶部导航栏 */}
            <AppBar position="sticky" color="inherit" elevation={0} sx={{ backgroundColor: 'white' }}>
                <Toolbar sx={{ padding: '0.5rem 1rem' }}>
                    <IconButton 
                        edge="start" 
                        color="primary" 
                        aria-label="back"
                        onClick={() => navigate(-1)}
                    >
                        <ArrowBackIosNewIcon fontSize="small" />
                    </IconButton>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1, textAlign: 'center', color: COLORS.dark, fontWeight: 'bold' }}>
                        恋爱工具箱
                    </Typography>
                    <Box sx={{ width: 24 }} /> {/* 保持布局对称 */}
                </Toolbar>
            </AppBar>
            
            <Box sx={{ p: 3, minHeight: 'calc(100vh - 112px)', backgroundColor: COLORS.lightPink }}>
                {/* 搜索框区域 */}
                <Box sx={{ mb: 4, position: 'relative' }}>
                    <input 
                        type="text" 
                        placeholder="搜索工具..." 
                        style={{
                            width: '100%',
                            padding: '0.75rem 2.5rem',
                            borderRadius: '1.25rem',
                            border: 'none',
                            backgroundColor: 'white',
                            boxShadow: '0 2px 8px rgba(255, 94, 135, 0.05)',
                            outline: 'none',
                            fontSize: '0.9rem',
                            color: COLORS.dark,
                            transition: 'boxShadow 0.3s ease',
                            '&:focus': {
                                boxShadow: '0 2px 12px rgba(255, 94, 135, 0.15)',
                            }
                        }}
                    />
                    <i 
                        className="fa fa-search" 
                        style={{
                            position: 'absolute',
                            left: '1rem',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: '#999',
                            fontSize: '0.9rem'
                        }}
                    ></i>
                </Box>
                
                {/* 工具网格布局 */}
                <Grid container spacing={3} justifyContent="center">
                    {tools.map(tool => (
                        <Grid item
                            key={tool.id}
                            xs={6}
                            sm={4}
                            md={3}
                            lg={3}
                            sx={{ display: 'flex', justifyContent: 'center' }}
                        >
                            <StyledCard onClick={tool.onClick}>
                                <StyledCardMedia
                                    component="img"
                                    image={tool.iconUrl}
                                    alt={tool.name}
                                />
                                <CardContent sx={{ padding: '1rem', textAlign: 'center' }}>
                                    <Typography variant="body1" component="p" sx={{ 
                                        color: COLORS.dark, 
                                        fontWeight: '500',
                                        fontSize: '0.95rem',
                                        letterSpacing: '0.02em'
                                    }}>
                                        {tool.name}
                                    </Typography>
                                </CardContent>
                            </StyledCard>
                        </Grid>
                    ))}
                </Grid>
            </Box>
            <BottomNavigationBar />
        </Layout>
    );
}

export default ToolPage;    