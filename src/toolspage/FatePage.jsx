import React, { useState } from 'react';
import {
    Grid,
    Typography,
    Box,
    Button,
    TextField,
    Card,
    CardContent,
    CardMedia,
    Divider,
    AppBar,
    Toolbar,
    IconButton,
    CircularProgress,
    Modal
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import BottomNavigationBar from '../BottomNavigationBar.jsx';
import Layout from '../Layout.jsx';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import { styled } from '@mui/system';
import COLORS from '../constants/color.js';

// 自定义卡片样式
const StyledCard = styled(Card)(({ theme }) => ({
    borderRadius: '1rem',
    border: 'none',
    boxShadow: '0 4px 15px rgba(255, 94, 135, 0.08)',
    overflow: 'hidden',
}));

// 自定义按钮样式
const StyledButton = styled(Button)(({ theme }) => ({
    backgroundColor: COLORS.primary,
    color: 'white',
    borderRadius: '2rem',
    padding: '0.75rem 2rem',
    textTransform: 'none',
    fontSize: '1rem',
    fontWeight: 'bold',
    boxShadow: '0 4px 15px rgba(255, 94, 135, 0.3)',
    transition: 'all 0.3s ease',
    '&:hover': {
        backgroundColor: COLORS.primary,
        transform: 'translateY(-2px)',
        boxShadow: '0 6px 20px rgba(255, 94, 135, 0.4)',
    },
    '&:active': {
        transform: 'translateY(0)',
    }
}));

// 八字合婚结果模态框
const ResultModal = styled(Modal)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
}));

function FatePage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        maleName: '',
        maleYear: '',
        maleMonth: '',
        maleDay: '',
        maleHour: '',
        femaleName: '',
        femaleYear: '',
        femaleMonth: '',
        femaleDay: '',
        femaleHour: ''
    });
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [openResult, setOpenResult] = useState(false);

    // 处理表单输入变化
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // 提交表单计算八字合婚结果
    const submitForm = () => {
        // 验证表单
        if (!formData.maleName || !formData.femaleName || 
            !formData.maleYear || !formData.maleMonth || !formData.maleDay || !formData.maleHour ||
            !formData.femaleYear || !formData.femaleMonth || !formData.femaleDay || !formData.femaleHour) {
            alert('请填写完整信息');
            return;
        }

        setLoading(true);
        // 模拟API请求延迟
        setTimeout(() => {
            // 生成随机结果
            const score = Math.floor(Math.random() * 40) + 60;
            let analysis = '';
            
            if (score >= 85) {
                analysis = '你们的八字相合程度极高，是天生的一对。两人性格互补，运势相助，婚后生活美满幸福，能够互相扶持，共同创造美好的未来。';
            } else if (score >= 70) {
                analysis = '你们的八字相合程度良好，是比较理想的一对。虽然偶尔会有小摩擦，但只要双方互相理解和包容，婚姻生活将会和谐美满。';
            } else if (score >= 55) {
                analysis = '你们的八字存在一定的差异，需要在相处中多花心思去理解和包容对方。婚姻生活中可能会遇到一些挑战，但只要双方共同努力，依然可以建立幸福的家庭。';
            } else {
                analysis = '你们的八字相合程度较低，婚姻生活可能会面临一些困难和挑战。建议双方在相处中多沟通，互相尊重，共同努力克服困难。';
            }
            
            setResult({
                score,
                analysis,
                maleBazi: `${formData.maleYear}年 ${formData.maleMonth}月 ${formData.maleDay}日 ${formData.maleHour}时`,
                femaleBazi: `${formData.femaleYear}年 ${formData.femaleMonth}月 ${formData.femaleDay}日 ${formData.femaleHour}时`
            });
            setLoading(false);
            setOpenResult(true);
        }, 2000);
    };

    // 关闭结果模态框
    const closeResultModal = () => {
        setOpenResult(false);
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
                        八字合婚
                    </Typography>
                    <Box sx={{ width: 24 }} /> {/* 保持布局对称 */}
                </Toolbar>
            </AppBar>

            <Box sx={{ p: 3, minHeight: 'calc(100vh - 112px)', backgroundColor: COLORS.lightPink }}>
                {/* 介绍卡片 */}
                <StyledCard sx={{ mb: 4 }}>
                    <CardMedia
                        component="img"
                        height="180"
                        image="https://picsum.photos/seed/fate/800/400"
                        alt="八字合婚"
                    />
                    <CardContent sx={{ backgroundColor: 'white', padding: '1.5rem' }}>
                        <Typography variant="h6" fontWeight="bold" mb={2} color={COLORS.dark}>
                            八字合婚
                        </Typography>
                        <Typography variant="body2" color="#666">
                            八字合婚是中国传统婚俗中非常重要的一环，通过分析男女双方的生辰八字，来判断两人是否合适结婚，婚姻是否美满幸福。请输入双方的生辰八字，开始合婚分析。
                        </Typography>
                    </CardContent>
                </StyledCard>

                {/* 男方信息 */}
                <StyledCard sx={{ mb: 4 }}>
                    <CardContent sx={{ padding: '1.5rem' }}>
                        <Typography variant="h6" fontWeight="bold" mb={3} color={COLORS.dark}>
                            男方信息
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    label="姓名"
                                    name="maleName"
                                    value={formData.maleName}
                                    onChange={handleChange}
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                    sx={{ borderRadius: '0.75rem' }}
                                />
                            </Grid>
                            <Grid item xs={3}>
                                <TextField
                                    label="年"
                                    name="maleYear"
                                    value={formData.maleYear}
                                    onChange={handleChange}
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                    sx={{ borderRadius: '0.75rem' }}
                                />
                            </Grid>
                            <Grid item xs={3}>
                                <TextField
                                    label="月"
                                    name="maleMonth"
                                    value={formData.maleMonth}
                                    onChange={handleChange}
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                    sx={{ borderRadius: '0.75rem' }}
                                />
                            </Grid>
                            <Grid item xs={3}>
                                <TextField
                                    label="日"
                                    name="maleDay"
                                    value={formData.maleDay}
                                    onChange={handleChange}
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                    sx={{ borderRadius: '0.75rem' }}
                                />
                            </Grid>
                            <Grid item xs={3}>
                                <TextField
                                    label="时"
                                    name="maleHour"
                                    value={formData.maleHour}
                                    onChange={handleChange}
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                    sx={{ borderRadius: '0.75rem' }}
                                />
                            </Grid>
                        </Grid>
                    </CardContent>
                </StyledCard>

                {/* 女方信息 */}
                <StyledCard sx={{ mb: 4 }}>
                    <CardContent sx={{ padding: '1.5rem' }}>
                        <Typography variant="h6" fontWeight="bold" mb={3} color={COLORS.dark}>
                            女方信息
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    label="姓名"
                                    name="femaleName"
                                    value={formData.femaleName}
                                    onChange={handleChange}
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                    sx={{ borderRadius: '0.75rem' }}
                                />
                            </Grid>
                            <Grid item xs={3}>
                                <TextField
                                    label="年"
                                    name="femaleYear"
                                    value={formData.femaleYear}
                                    onChange={handleChange}
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                    sx={{ borderRadius: '0.75rem' }}
                                />
                            </Grid>
                            <Grid item xs={3}>
                                <TextField
                                    label="月"
                                    name="femaleMonth"
                                    value={formData.femaleMonth}
                                    onChange={handleChange}
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                    sx={{ borderRadius: '0.75rem' }}
                                />
                            </Grid>
                            <Grid item xs={3}>
                                <TextField
                                    label="日"
                                    name="femaleDay"
                                    value={formData.femaleDay}
                                    onChange={handleChange}
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                    sx={{ borderRadius: '0.75rem' }}
                                />
                            </Grid>
                            <Grid item xs={3}>
                                <TextField
                                    label="时"
                                    name="femaleHour"
                                    value={formData.femaleHour}
                                    onChange={handleChange}
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                    sx={{ borderRadius: '0.75rem' }}
                                />
                            </Grid>
                        </Grid>
                    </CardContent>
                </StyledCard>

                {/* 计算按钮 */}
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                    <StyledButton onClick={submitForm} disabled={loading}>
                        {loading ? (
                            <>
                                <CircularProgress size={24} color="inherit" sx={{ mr: 2 }} />
                                计算中...
                            </>
                        ) : (
                            '开始合婚'
                        )}
                    </StyledButton>
                </Box>
            </Box>

            {/* 结果模态框 */}
            <ResultModal
                open={openResult}
                onClose={closeResultModal}
                aria-labelledby="fate-result-title"
                aria-describedby="fate-result-description"
            >
                <Card sx={{ width: '90%', maxWidth: '500px', borderRadius: '1rem', overflow: 'hidden' }}>
                    <CardMedia
                        component="img"
                        height="150"
                        image="https://picsum.photos/seed/fateresult/800/300"
                        alt="八字合婚结果"
                    />
                    <CardContent sx={{ padding: '1.5rem' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                            <Typography variant="h5" fontWeight="bold" color={COLORS.dark} id="fate-result-title">
                                八字合婚结果
                            </Typography>
                            <IconButton onClick={closeResultModal} color="primary">
                                <i className="fa fa-times"></i>
                            </IconButton>
                        </Box>
                        
                        <Grid container spacing={3} mb={4}>
                            <Grid item xs={6}>
                                <Typography variant="body2" color="#666" mb={1}>男方八字</Typography>
                                <Typography variant="subtitle2" color={COLORS.dark}>{result?.maleBazi || ''}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body2" color="#666" mb={1}>女方八字</Typography>
                                <Typography variant="subtitle2" color={COLORS.dark}>{result?.femaleBazi || ''}</Typography>
                            </Grid>
                        </Grid>
                        
                        <Divider sx={{ mb: 4 }} />
                        
                        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
                            <Box sx={{ width: 120, height: 120, borderRadius: '50%', backgroundColor: COLORS.primary + '10', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                                <Typography variant="h3" fontWeight="bold" color={COLORS.primary}>{result?.score || 0}</Typography>
                                <Typography variant="body2" color="#666">缘分指数</Typography>
                            </Box>
                        </Box>
                        
                        <Typography variant="body2" color="#666" mb={4} id="fate-result-description">
                            {result?.analysis || ''}
                        </Typography>
                        
                        <Button
                            variant="contained"
                            color="primary"
                            fullWidth
                            onClick={closeResultModal}
                            sx={{ borderRadius: '1rem', textTransform: 'none' }}
                        >
                            我知道了
                        </Button>
                    </CardContent>
                </Card>
            </ResultModal>

            <BottomNavigationBar />
        </Layout>
    );
}

export default FatePage;    