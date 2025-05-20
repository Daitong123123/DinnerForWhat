import React, { useState, useEffect } from 'react';
import {
    Grid,
    Typography,
    Box,
    Button,
    Card,
    CardContent,
    CardMedia,
    FormControl,
    Select,
    MenuItem,
    InputLabel,
    Avatar,
    AppBar,
    Toolbar,
    IconButton,
    CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import BottomNavigationBar from '../BottomNavigationBar.jsx';
import Layout from '../Layout.jsx';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import { styled } from '@mui/system';
import COLORS from '../constants/color.js';

// 星座数据
const horoscopes = [
    { id: 'aries', name: '白羊座', date: '3月21日-4月19日', symbol: '♈', image: 'https://picsum.photos/seed/aries/400/400' },
    { id: 'taurus', name: '金牛座', date: '4月20日-5月20日', symbol: '♉', image: 'https://picsum.photos/seed/taurus/400/400' },
    { id: 'gemini', name: '双子座', date: '5月21日-6月21日', symbol: '♊', image: 'https://picsum.photos/seed/gemini/400/400' },
    { id: 'cancer', name: '巨蟹座', date: '6月22日-7月22日', symbol: '♋', image: 'https://picsum.photos/seed/cancer/400/400' },
    { id: 'leo', name: '狮子座', date: '7月23日-8月22日', symbol: '♌', image: 'https://picsum.photos/seed/leo/400/400' },
    { id: 'virgo', name: '处女座', date: '8月23日-9月22日', symbol: '♍', image: 'https://picsum.photos/seed/virgo/400/400' },
    { id: 'libra', name: '天秤座', date: '9月23日-10月23日', symbol: '♎', image: 'https://picsum.photos/seed/libra/400/400' },
    { id: 'scorpio', name: '天蝎座', date: '10月24日-11月22日', symbol: '♏', image: 'https://picsum.photos/seed/scorpio/400/400' },
    { id: 'sagittarius', name: '射手座', date: '11月23日-12月21日', symbol: '♐', image: 'https://picsum.photos/seed/sagittarius/400/400' },
    { id: 'capricorn', name: '摩羯座', date: '12月22日-1月19日', symbol: '♑', image: 'https://picsum.photos/seed/capricorn/400/400' },
    { id: 'aquarius', name: '水瓶座', date: '1月20日-2月18日', symbol: '♒', image: 'https://picsum.photos/seed/aquarius/400/400' },
    { id: 'pisces', name: '双鱼座', date: '2月19日-3月20日', symbol: '♓', image: 'https://picsum.photos/seed/pisces/400/400' }
];

// 星座配对数据
const compatibilityData = {
    aries: {
        aries: 70,
        taurus: 50,
        gemini: 80,
        cancer: 40,
        leo: 90,
        virgo: 30,
        libra: 60,
        scorpio: 55,
        sagittarius: 95,
        capricorn: 45,
        aquarius: 75,
        pisces: 65
    },
    taurus: {
        aries: 50,
        taurus: 80,
        gemini: 40,
        cancer: 75,
        leo: 55,
        virgo: 90,
        libra: 60,
        scorpio: 65,
        sagittarius: 45,
        capricorn: 85,
        aquarius: 35,
        pisces: 70
    },
    // 其他星座配对数据省略...
    libra: {
        aries: 60,
        taurus: 60,
        gemini: 85,
        cancer: 50,
        leo: 90,
        virgo: 55,
        libra: 75,
        scorpio: 70,
        sagittarius: 65,
        capricorn: 45,
        aquarius: 95,
        pisces: 75
    },
    // 其他星座配对数据省略...
};

// 生成随机星座运势数据
const generateHoroscopeData = (sign) => {
    return {
        love: Math.floor(Math.random() * 40) + 60,
        career: Math.floor(Math.random() * 40) + 60,
        money: Math.floor(Math.random() * 40) + 60,
        health: Math.floor(Math.random() * 40) + 60,
        description: `今天对于${horoscopes.find(h => h.id === sign)?.name || sign}来说是充满${Math.random() > 0.5 ? '机遇' : '挑战'}的一天。爱情方面，你可能会遇到${Math.random() > 0.5 ? '令人心动的邂逅' : '需要沟通的情况'}。事业上，${Math.random() > 0.5 ? '努力会得到回报' : '需要更加专注'}。财运平稳，健康方面注意${Math.random() > 0.5 ? '休息' : '饮食'}。`
    };
};

// 自定义卡片样式
const StyledCard = styled(Card)(({ theme }) => ({
    borderRadius: '1rem',
    border: 'none',
    boxShadow: '0 4px 15px rgba(255, 94, 135, 0.08)',
    overflow: 'hidden',
}));

// 自定义进度条样式
const ProgressBar = styled(Box)(({ theme, value, color }) => ({
    height: '8px',
    borderRadius: '4px',
    backgroundColor: '#f0f0f0',
    overflow: 'hidden',
    '&:before': {
        content: '""',
        display: 'block',
        height: '100%',
        width: `${value}%`,
        backgroundColor: color || COLORS.primary,
        borderRadius: '4px',
    }
}));

function HoroscopePage() {
    const navigate = useNavigate();
    const [selectedSign, setSelectedSign] = useState('aries');
    const [partnerSign, setPartnerSign] = useState('libra');
    const [horoscopeData, setHoroscopeData] = useState(null);
    const [loading, setLoading] = useState(true);

    // 加载星座运势数据
    useEffect(() => {
        setLoading(true);
        // 模拟API请求延迟
        setTimeout(() => {
            setHoroscopeData(generateHoroscopeData(selectedSign));
            setLoading(false);
        }, 800);
    }, [selectedSign]);

    // 获取星座兼容性
    const getCompatibility = () => {
        return compatibilityData[selectedSign]?.[partnerSign] || 50;
    };

    // 获取星座对象
    const getHoroscope = (id) => {
        return horoscopes.find(h => h.id === id) || { name: id };
    };

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
                        星座解析
                    </Typography>
                    <Box sx={{ width: 24 }} /> {/* 保持布局对称 */}
                </Toolbar>
            </AppBar>

            <Box sx={{ p: 3, minHeight: 'calc(100vh - 112px)', backgroundColor: COLORS.lightPink }}>
                {/* 星座选择 */}
                <StyledCard sx={{ mb: 4 }}>
                    <CardContent sx={{ padding: '1.5rem' }}>
                        <Typography variant="subtitle1" fontWeight="500" mb={3} color={COLORS.dark}>
                            选择你的星座
                        </Typography>
                        <Grid container spacing={3} alignItems="center">
                            <Grid item xs={6}>
                                <FormControl fullWidth>
                                    <InputLabel id="your-sign-label">你的星座</InputLabel>
                                    <Select
                                        labelId="your-sign-label"
                                        id="your-sign"
                                        value={selectedSign}
                                        label="你的星座"
                                        onChange={(e) => setSelectedSign(e.target.value)}
                                        sx={{ borderRadius: '0.75rem' }}
                                    >
                                        {horoscopes.map(horoscope => (
                                            <MenuItem key={horoscope.id} value={horoscope.id}>
                                                {horoscope.name} {horoscope.symbol}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={6}>
                                <FormControl fullWidth>
                                    <InputLabel id="partner-sign-label">TA的星座</InputLabel>
                                    <Select
                                        labelId="partner-sign-label"
                                        id="partner-sign"
                                        value={partnerSign}
                                        label="TA的星座"
                                        onChange={(e) => setPartnerSign(e.target.value)}
                                        sx={{ borderRadius: '0.75rem' }}
                                    >
                                        {horoscopes.map(horoscope => (
                                            <MenuItem key={horoscope.id} value={horoscope.id}>
                                                {horoscope.name} {horoscope.symbol}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                    </CardContent>
                </StyledCard>

                {/* 星座信息卡片 */}
                <StyledCard sx={{ mb: 4 }}>
                    <CardMedia
                        component="img"
                        height="180"
                        image={getHoroscope(selectedSign).image}
                        alt={getHoroscope(selectedSign).name}
                    />
                    <CardContent sx={{ padding: '1.5rem' }}>
                        <Grid container alignItems="center">
                            <Grid item xs={8}>
                                <Typography variant="h5" fontWeight="bold" color={COLORS.dark}>
                                    {getHoroscope(selectedSign).name} {getHoroscope(selectedSign).symbol}
                                </Typography>
                                <Typography variant="body2" color="#666">
                                    {getHoroscope(selectedSign).date}
                                </Typography>
                            </Grid>
                            <Grid item xs={4} sx={{ textAlign: 'right' }}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    size="small"
                                    sx={{ borderRadius: '1rem', textTransform: 'none' }}
                                >
                                    今日运势
                                </Button>
                            </Grid>
                        </Grid>
                    </CardContent>
                </StyledCard>

                {/* 运势详情 */}
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                        <CircularProgress color="primary" />
                    </Box>
                ) : (
                    <Box sx={{ mb: 4 }}>
                        <StyledCard sx={{ mb: 4 }}>
                            <CardContent sx={{ padding: '1.5rem' }}>
                                <Typography variant="h6" fontWeight="bold" mb={3} color={COLORS.dark}>
                                    今日运势解析
                                </Typography>
                                <Typography variant="body2" color="#666" mb={4}>
                                    {horoscopeData?.description || '暂无运势数据'}
                                </Typography>
                                
                                <Grid container spacing={3}>
                                    <Grid item xs={6}>
                                        <Box sx={{ mb: 2 }}>
                                            <Grid container justifyContent="space-between" mb={1}>
                                                <Typography variant="body2" color="#666">爱情指数</Typography>
                                                <Typography variant="body2" color={COLORS.primary}>{horoscopeData?.love || 0}%</Typography>
                                            </Grid>
                                            <ProgressBar value={horoscopeData?.love || 0} color={COLORS.primary} />
                                        </Box>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Box sx={{ mb: 2 }}>
                                            <Grid container justifyContent="space-between" mb={1}>
                                                <Typography variant="body2" color="#666">事业指数</Typography>
                                                <Typography variant="body2" color={COLORS.primary}>{horoscopeData?.career || 0}%</Typography>
                                            </Grid>
                                            <ProgressBar value={horoscopeData?.career || 0} color={COLORS.primary} />
                                        </Box>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Box sx={{ mb: 2 }}>
                                            <Grid container justifyContent="space-between" mb={1}>
                                                <Typography variant="body2" color="#666">财运指数</Typography>
                                                <Typography variant="body2" color={COLORS.primary}>{horoscopeData?.money || 0}%</Typography>
                                            </Grid>
                                            <ProgressBar value={horoscopeData?.money || 0} color={COLORS.primary} />
                                        </Box>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Box sx={{ mb: 2 }}>
                                            <Grid container justifyContent="space-between" mb={1}>
                                                <Typography variant="body2" color="#666">健康指数</Typography>
                                                <Typography variant="body2" color={COLORS.primary}>{horoscopeData?.health || 0}%</Typography>
                                            </Grid>
                                            <ProgressBar value={horoscopeData?.health || 0} color={COLORS.primary} />
                                        </Box>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </StyledCard>

                        {/* 星座配对 */}
                        <StyledCard>
                            <CardContent sx={{ padding: '1.5rem' }}>
                                <Typography variant="h6" fontWeight="bold" mb={3} color={COLORS.dark}>
                                    星座配对
                                </Typography>
                                <Grid container alignItems="center" justifyContent="center" mb={4}>
                                    <Grid item xs={4} sx={{ textAlign: 'center' }}>
                                        <Avatar src={getHoroscope(selectedSign).image} sx={{ width: 60, height: 60, mx: 'auto' }} />
                                        <Typography variant="body2" mt={1}>{getHoroscope(selectedSign).name}</Typography>
                                    </Grid>
                                    <Grid item xs={4} sx={{ textAlign: 'center' }}>
                                        <Box sx={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: COLORS.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto' }}>
                                            <i className="fa fa-heart" style={{ color: 'white' }}></i>
                                        </Box>
                                        <Typography variant="body2" mt={1} color={COLORS.primary} fontWeight="bold">
                                            {getCompatibility()}%
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={4} sx={{ textAlign: 'center' }}>
                                        <Avatar src={getHoroscope(partnerSign).image} sx={{ width: 60, height: 60, mx: 'auto' }} />
                                        <Typography variant="body2" mt={1}>{getHoroscope(partnerSign).name}</Typography>
                                    </Grid>
                                </Grid>
                                <Typography variant="body2" color="#666">
                                    {getCompatibility() >= 80 ? 
                                        '你们是天生一对，有着极高的契合度，彼此理解和支持，爱情之路会十分顺利。' : 
                                        getCompatibility() >= 60 ? 
                                            '你们相处愉快，有许多共同之处，但也需要在一些方面互相包容和理解。' : 
                                            '你们的性格差异较大，需要更多的沟通和努力来维持关系，但也可能因此互补。'}
                                </Typography>
                            </CardContent>
                        </StyledCard>
                    </Box>
                )}
            </Box>
            <BottomNavigationBar />
        </Layout>
    );
}

export default HoroscopePage;    