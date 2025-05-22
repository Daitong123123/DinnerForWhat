import React, { useState, useEffect } from 'react';
import {
    Grid, Typography, Box, Button, Card, CardMedia, Dialog,
    DialogTitle, DialogContent, DialogActions, TextField,
    AppBar, Toolbar, IconButton, CircularProgress,
    Backdrop, CardContent, Skeleton, Paper,
    Snackbar, Alert, FormControl, InputLabel, Select, MenuItem,
    Divider, List, ListItem, ListItemAvatar, ListItemText, Avatar,
    Tabs, Tab, Badge
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { allTarotCards, spreadTypes } from '../data/tarotData';
import { readingSpreads } from '../data/readingSpreads.js';
import { ArrowBack, Refresh, Send, Star, StarBorder, HelpCircle, NightlightRound, Sun } from '@mui/icons-material';
import { shuffle } from 'lodash'; // 用于洗牌 (npm install lodash)
import COLORS from '../constants/color.js'; // 恋爱记风格的颜色常量

// 自定义卡片样式 - 恋爱记风格
const StyledCard = styled(Card)(({ theme }) => ({ 
    width: '100%',
    borderRadius: '1rem',
    border: 'none',
    boxShadow: '0 8px 25px rgba(255, 94, 135, 0.15)',
    transition: 'all 0.3s ease',
    position: 'relative',
    overflow: 'hidden',
    cursor: 'pointer',
    '&:hover': {
        transform: 'translateY(-5px) scale(1.02)',
        boxShadow: '0 12px 30px rgba(255, 94, 135, 0.25)',
    },
    '&:before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 60%)',
        zIndex: 1,
        opacity: 0.8,
    }
}));

// 塔罗牌背面样式 - 恋爱记风格
const CardBack = styled(CardMedia)(({ theme }) => ({
    height: '200px',
    background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.secondary} 100%)`,
    borderRadius: '1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '2rem',
    fontWeight: 'bold',
    boxShadow: '0 4px 15px rgba(255, 94, 135, 0.15)',
}));

// 塔罗牌详情对话框样式 - 恋爱记风格
const CardDetailDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialog-paper': {
        borderRadius: '1.5rem',
        maxWidth: '600px',
        padding: '1rem',
        boxShadow: '0 15px 30px rgba(255, 94, 135, 0.1)',
    }
}));

// 引导卡片样式
const GuideCard = styled(Card)(({ theme }) => ({
    borderRadius: '1.25rem',
    boxShadow: '0 8px 20px rgba(255, 94, 135, 0.1)',
    border: 'none',
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: 'white',

    '&:before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '6px',
        background: `linear-gradient(90deg, ${COLORS.primary}, ${COLORS.secondary})`,
    },

    '& .MuiCardContent-root': {
        padding: '1.5rem',
    },
}));

// 步骤指示器样式
const StepIndicator = styled(Box)(({ theme, active }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    color: active ? COLORS.primary : '#999',

    '& .step-circle': {
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        backgroundColor: active ? COLORS.primary : '#f0f0f0',
        color: active ? 'white' : '#999',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        marginBottom: '0.5rem',
    },

    '& .step-line': {
        width: '2px',
        height: '20px',
        backgroundColor: active ? COLORS.primary : '#f0f0f0',
        margin: '0.5rem 0',
    },
}));

// AI解读结果卡片
const AIReadingCard = styled(Paper)(({ theme }) => ({
    borderRadius: '1rem',
    padding: '1.5rem',
    margin: '2rem 0',
    backgroundColor: 'white',
    boxShadow: '0 8px 20px rgba(255, 94, 135, 0.1)',

    '& .ai-header': {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '1rem',

        '& .ai-icon': {
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: COLORS.primary + '15',
            color: COLORS.primary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '0.75rem',
        },
    },

    '& .ai-content': {
        lineHeight: 1.8,
        color: '#444',
    },
}));

function TarotPage() {
    const navigate = useNavigate();
    // 优化后的步骤流程：1=引导页, 2=输入问题, 3=选牌阵, 4=洗牌, 5=结果
    const [step, setStep] = useState(1);
    const [question, setQuestion] = useState('');
    const [selectedSpread, setSelectedSpread] = useState(spreadTypes[0]);
    const [cards, setCards] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showCardDetail, setShowCardDetail] = useState(false);
    const [selectedCard, setSelectedCard] = useState(null);
    const [readingResult, setReadingResult] = useState('');
    const [showReadingResult, setShowReadingResult] = useState(false);
    const [showAIReading, setShowAIReading] = useState(false);
    const [aiReadingResult, setAIReadingResult] = useState('');
    const [aiLoading, setAILoading] = useState(false);
    const [showSnackbar, setShowSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const [savedReadings, setSavedReadings] = useState([]);
    const [showSavedReadings, setShowSavedReadings] = useState(false);

    // 洗牌逻辑
    const shuffleCards = () => {
        setIsLoading(true);
        setShowReadingResult(false);
        setShowAIReading(false);

        // 随机选择牌阵中的牌数
        const selectedCards = shuffle(allTarotCards).slice(0, selectedSpread.cardCount);

        // 为每张牌添加正逆位属性
        const cardsWithPosition = selectedCards.map(card => ({
            ...card,
            isReversed: Math.random() > 0.5 // 50%概率逆位
        }));

        // 延迟显示结果，模拟洗牌动画
        setTimeout(() => {
            setCards(cardsWithPosition);
            setIsLoading(false);
            setStep(5);

            // 生成塔罗牌解读结果
            generateReadingResult(cardsWithPosition);
        }, 1500);
    };

    // 生成塔罗牌解读结果
    const generateReadingResult = (cards) => {
        // 简单示例：基于牌的正逆位和位置生成解读
        const result = selectedSpread.positions.map((position, index) => {
            const card = cards[index];
            const positionName = position.name;
            const cardName = card.name;
            const cardMeaning = card.isReversed ? card.reversed : card.upright;

            return `${positionName}：${cardName} ${card.isReversed ? "(逆位)" : ""}\n解读：${cardMeaning}\n\n`;
        }).join('');

        setReadingResult(result);
    };

    // 调用AI进行解读
    const getAIReading = async () => {
        if (!question || !cards || cards.length === 0) {
            showSnackbarMessage('请先完成占卜过程', 'error');
            return;
        }

        setAILoading(true);
        setShowAIReading(true);

        // 模拟API调用
        try {
            // 实际项目中这里应该是真实的API调用
            // const response = await fetch('/api/ai/tarot', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({
            //         question,
            //         spread: selectedSpread.name,
            //         cards: cards.map(card => ({
            //             name: card.name,
            //             isReversed: card.isReversed
            //         }))
            //     })
            // });

            // const result = await response.json();

            // 模拟API响应
            const result = {
                reading: `亲爱的用户，关于您的问题「${question}」，塔罗牌给出了以下指引：
                
${selectedSpread.name}牌阵揭示了您当前状况的多个方面。您抽到的牌是：
${cards.map(card => `- ${card.name} ${card.isReversed ? "(逆位)" : ""}`).join('\n')}

这些牌的组合表明，目前您正处于一个${cards[0].isReversed ? "需要调整方向" : "充满机会"}的阶段。
${cards[0].name}出现在${selectedSpread.positions[0].name}位置，暗示着${cards[0].isReversed ? cards[0].reversed : cards[0].upright}。

在关系方面，${cards[1].name}显示${cards[1].isReversed ? cards[1].reversed : cards[1].upright}。

未来发展上，${cards[2].name}预示着${cards[2].isReversed ? cards[2].reversed : cards[2].upright}。

总体而言，建议您${cards[0].isReversed ? "重新审视您的目标和价值观" : "保持积极的心态并抓住机会"}。塔罗牌提醒您，命运是可以通过选择改变的，相信自己的直觉，您将做出正确的决定。

愿您的旅程充满光明与智慧！`
            };

            setAIReadingResult(result.reading);
            showSnackbarMessage('AI解读完成', 'success');

            // 保存这次解读
            saveReading(result.reading);

        } catch (error) {
            console.error('AI解读失败:', error);
            showSnackbarMessage('AI解读失败，请稍后再试', 'error');
        } finally {
            setAILoading(false);
        }
    };

    // 保存解读结果
    const saveReading = (reading) => {
        const newReading = {
            id: Date.now(),
            question,
            spread: selectedSpread.name,
            cards: cards.map(card => ({
                name: card.name,
                isReversed: card.isReversed,
                image: card.image
            })),
            reading,
            date: new Date().toISOString()
        };

        // 更新保存的解读列表
        setSavedReadings(prev => [newReading, ...prev]);

        // 在实际应用中，这里应该将数据保存到本地存储或后端
        // localStorage.setItem('savedTarotReadings', JSON.stringify([newReading, ...prev]));
    };

    // 从本地存储加载已保存的解读
    useEffect(() => {
        // 在实际应用中，这里应该从本地存储或后端加载数据
        // const saved = localStorage.getItem('savedTarotReadings');
        // if (saved) {
        //     setSavedReadings(JSON.parse(saved));
        // }
    }, []);

    // 显示提示信息
    const showSnackbarMessage = (message, severity = 'success') => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setShowSnackbar(true);
    };

    // 打开牌详情对话框
    const openCardDetail = (card) => {
        setSelectedCard(card);
        setShowCardDetail(true);
    };

    // 关闭牌详情对话框
    const closeCardDetail = () => {
        setShowCardDetail(false);
    };

    // 显示塔罗牌解读结果
    const showReading = () => {
        setShowReadingResult(true);
    };

    // 格式化日期
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div>
            {/* 导航栏 */}
            <AppBar position="sticky" sx={{
                backgroundColor: 'white',
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
            }}>
                <Toolbar>
                    <IconButton onClick={() => navigate(-1)}>
                        <ArrowBack color="primary" />
                    </IconButton>
                    <Typography variant="h6" fontWeight="bold" sx={{ color: COLORS.dark }}>
                        塔罗牌占卜
                    </Typography>
                    <IconButton
                        onClick={() => setShowSavedReadings(!showSavedReadings)}
                        color="primary"
                    >
                        <Badge
                            badgeContent={savedReadings.length}
                            color="secondary"
                            invisible={savedReadings.length === 0}
                        >
                            <StarBorder />
                        </Badge>
                    </IconButton>
                </Toolbar>
            </AppBar>

            {/* 主内容区域 */}
            <Box sx={{ p: 3, minHeight: 'calc(100vh - 112px)', bgcolor: COLORS.lightPink }}>
                {/* 步骤1：引导页 */}
                {step === 1 && (
                    <GuideCard>
                        <CardContent>
                            <Typography
                                variant="h4"
                                fontWeight="bold"
                                sx={{
                                    color: COLORS.dark,
                                    marginBottom: '1rem',
                                    textAlign: 'center'
                                }}
                            >
                                塔罗牌占卜
                            </Typography>

                            <Box
                                sx={{
                                    width: '100px',
                                    height: '100px',
                                    borderRadius: '50%',
                                    backgroundColor: `${COLORS.primary}15`,
                                    margin: '1rem auto',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <NightlightRound sx={{ color: COLORS.primary, fontSize: '3rem' }} />
                            </Box>

                            <Typography
                                variant="body1"
                                sx={{
                                    color: '#666',
                                    lineHeight: 1.7,
                                    marginBottom: '2rem',
                                    textAlign: 'center'
                                }}
                            >
                                塔罗牌占卜是一种古老的占卜方式，它可以帮助您了解自己的内心世界，探索未来的可能性。
                                <br /><br />
                                现在，请静下心来，专注于您的问题，然后点击下方按钮开始您的占卜之旅。
                            </Typography>

                            <Button
                                variant="contained"
                                onClick={() => setStep(2)}
                                sx={{
                                    width: '100%',
                                    py: '1rem',
                                    borderRadius: '1rem',
                                    boxShadow: '0 8px 20px rgba(255, 94, 135, 0.2)',
                                    textTransform: 'none',
                                    fontWeight: 'bold',
                                    fontSize: '1.1rem',
                                    backgroundColor: COLORS.primary,
                                    '&:hover': {
                                        backgroundColor: COLORS.primaryDark,
                                        boxShadow: '0 10px 25px rgba(255, 94, 135, 0.3)',
                                    }
                                }}
                            >
                                开始占卜之旅
                            </Button>
                        </CardContent>
                    </GuideCard>
                )}

                {/* 步骤2：输入问题 */}
                {step === 2 && (
                    <GuideCard>
                        <CardContent>
                            <Typography
                                variant="h5"
                                fontWeight="bold"
                                sx={{
                                    color: COLORS.dark,
                                    marginBottom: '1.5rem',
                                    textAlign: 'center'
                                }}
                            >
                                专注于您的问题
                            </Typography>

                            <Typography
                                variant="body1"
                                sx={{
                                    color: '#666',
                                    lineHeight: 1.7,
                                    marginBottom: '2rem',
                                    textAlign: 'center'
                                }}
                            >
                                请输入您想要占卜的问题，塔罗牌将为您提供指引。问题越具体，解读越有针对性。
                            </Typography>

                            <TextField
                                multiline
                                rows={4}
                                fullWidth
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                placeholder="请输入您想要占卜的问题..."
                                variant="outlined"
                                sx={{
                                    borderRadius: '1rem',
                                    marginBottom: '2rem',
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '1rem',
                                        '&:hover fieldset': {
                                            borderColor: COLORS.primary,
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: COLORS.primary,
                                        }
                                    }
                                }}
                            />

                            <Button
                                variant="contained"
                                onClick={() => setStep(3)}
                                disabled={!question.trim()}
                                sx={{
                                    width: '100%',
                                    py: '0.8rem',
                                    borderRadius: '1rem',
                                    textTransform: 'none',
                                    fontWeight: 'bold',
                                    backgroundColor: COLORS.primary,
                                    '&:hover': {
                                        backgroundColor: COLORS.primaryDark,
                                    }
                                }}
                            >
                                继续选择牌阵
                            </Button>
                        </CardContent>
                    </GuideCard>
                )}

                {/* 步骤3：选择牌阵 */}
                {step === 3 && (
                    <GuideCard>
                        <CardContent>
                            <Typography
                                variant="h5"
                                fontWeight="bold"
                                sx={{
                                    color: COLORS.dark,
                                    marginBottom: '1.5rem',
                                    textAlign: 'center'
                                }}
                            >
                                选择您的牌阵
                            </Typography>

                            <Typography
                                variant="body1"
                                sx={{
                                    color: '#666',
                                    lineHeight: 1.7,
                                    marginBottom: '2rem',
                                    textAlign: 'center'
                                }}
                            >
                                不同的牌阵适用于不同类型的问题。请选择最适合您问题的牌阵。
                            </Typography>

                            <Grid container spacing={3} justifyContent="center">
                                {spreadTypes.map(spread => (
                                    <Grid item key={spread.id} xs={12} sm={6} md={4}>
                                        <Card
                                            onClick={() => setSelectedSpread(spread)}
                                            sx={{
                                                cursor: 'pointer',
                                                border: selectedSpread.id === spread.id ? `2px solid ${COLORS.primary}` : 'none',
                                                transition: 'all 0.3s',
                                                borderRadius: '1rem',
                                                overflow: 'hidden',
                                                boxShadow: selectedSpread.id === spread.id
                                                    ? `0 8px 20px rgba(255, 94, 135, 0.2)`
                                                    : '0 4px 10px rgba(0,0,0,0.05)',
                                                '&:hover': {
                                                    transform: 'translateY(-5px)',
                                                    boxShadow: `0 10px 25px rgba(255, 94, 135, 0.15)`
                                                }
                                            }}
                                        >
                                            <CardMedia
                                                component="img"
                                                image={spread.image}
                                                alt={spread.name}
                                                style={{
                                                    height: '120px',
                                                    objectFit: 'cover'
                                                }}
                                            />
                                            <CardContent>
                                                <Typography variant="h6" fontWeight="bold" mb={1}>
                                                    {spread.name}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary" mb={2}>
                                                    {spread.description}
                                                </Typography>
                                                <Typography variant="subtitle2">
                                                    {spread.cardCount}张牌
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>

                            <Button
                                variant="contained"
                                onClick={() => setStep(4)}
                                sx={{
                                    width: '100%',
                                    mt: 5,
                                    py: '0.8rem',
                                    borderRadius: '1rem',
                                    textTransform: 'none',
                                    fontWeight: 'bold',
                                    backgroundColor: COLORS.primary,
                                    '&:hover': {
                                        backgroundColor: COLORS.primaryDark,
                                    }
                                }}
                            >
                                开始洗牌
                            </Button>
                        </CardContent>
                    </GuideCard>
                )}

                {/* 步骤4：洗牌 */}
                {step === 4 && (
                    <GuideCard>
                        <CardContent>
                            <Typography
                                variant="h5"
                                fontWeight="bold"
                                sx={{
                                    color: COLORS.dark,
                                    marginBottom: '1.5rem',
                                    textAlign: 'center'
                                }}
                            >
                                准备洗牌
                            </Typography>

                            <Typography
                                variant="body1"
                                sx={{
                                    color: '#666',
                                    lineHeight: 1.7,
                                    marginBottom: '3rem',
                                    textAlign: 'center'
                                }}
                            >
                                集中注意力，默念您的问题：<br />
                                <Box sx={{ fontWeight: 'bold', color: COLORS.primary, mt: 1 }}>
                                    "{question}"
                                </Box>
                                <br />
                                然后点击下方按钮开始洗牌
                            </Typography>

                            <Button
                                variant="contained"
                                onClick={shuffleCards}
                                size="large"
                                sx={{
                                    width: '100%',
                                    py: '1rem',
                                    borderRadius: '1rem',
                                    textTransform: 'none',
                                    fontWeight: 'bold',
                                    fontSize: '1.1rem',
                                    backgroundColor: COLORS.primary,
                                    boxShadow: '0 8px 20px rgba(255, 94, 135, 0.2)',
                                    '&:hover': {
                                        backgroundColor: COLORS.primaryDark,
                                        boxShadow: '0 10px 25px rgba(255, 94, 135, 0.3)',
                                    }
                                }}
                            >
                                <Refresh sx={{ mr: 2 }} />
                                开始洗牌
                            </Button>
                        </CardContent>
                    </GuideCard>
                )}

                {/* 步骤5：显示结果 */}
                {step === 5 && (
                    <Box sx={{ maxWidth: '1200px', margin: '0 auto' }}>
                        {/* 步骤指示器 */}
                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            marginBottom: '2rem',
                            position: 'relative'
                        }}>
                            <Box sx={{
                                position: 'absolute',
                                top: '16px',
                                left: '0',
                                right: '0',
                                height: '2px',
                                backgroundColor: '#f0f0f0',
                                zIndex: 0
                            }} />

                            <StepIndicator active={step >= 1} sx={{ zIndex: 1 }}>
                                <div className="step-circle">1</div>
                                <Typography variant="caption">引导</Typography>
                            </StepIndicator>

                            <StepIndicator active={step >= 2} sx={{ zIndex: 1 }}>
                                <div className="step-circle">2</div>
                                <Typography variant="caption">问题</Typography>
                            </StepIndicator>

                            <StepIndicator active={step >= 3} sx={{ zIndex: 1 }}>
                                <div className="step-circle">3</div>
                                <Typography variant="caption">牌阵</Typography>
                            </StepIndicator>

                            <StepIndicator active={step >= 4} sx={{ zIndex: 1 }}>
                                <div className="step-circle">4</div>
                                <Typography variant="caption">洗牌</Typography>
                            </StepIndicator>

                            <StepIndicator active={step >= 5} sx={{ zIndex: 1 }}>
                                <div className="step-circle">5</div>
                                <Typography variant="caption">结果</Typography>
                            </StepIndicator>
                        </Box>

                        <Typography variant="h5" mb={4} fontWeight="bold" textAlign="center">
                            您的塔罗牌解读
                        </Typography>

                        {/* 显示问题 */}
                        {question && (
                            <Paper elevation={2} sx={{
                                p: 3,
                                mb: 4,
                                borderRadius: '1rem',
                                backgroundColor: 'white',
                                boxShadow: '0 4px 15px rgba(255, 94, 135, 0.08)'
                            }}>
                                <Typography variant="subtitle1" fontWeight="bold" mb={1.5} color={COLORS.primary}>
                                    您的问题：
                                </Typography>
                                <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                                    "{question}"
                                </Typography>
                            </Paper>
                        )}

                        {/* 显示牌阵名称和描述 */}
                        <Paper elevation={2} sx={{
                            p: 3,
                            mb: 4,
                            borderRadius: '1rem',
                            backgroundColor: 'white',
                            boxShadow: '0 4px 15px rgba(255, 94, 135, 0.08)'
                        }}>
                            <Typography variant="h6" fontWeight="bold" mb={1.5} color={COLORS.primary}>
                                牌阵：{selectedSpread.name}
                            </Typography>
                            <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                                {selectedSpread.description}
                            </Typography>
                        </Paper>

                        {/* 显示抽到的牌 */}
                        <Grid container spacing={3} mb={6}>
                            {cards.map((card, index) => (
                                <Grid
                                    item
                                    key={card.id}
                                    xs={12}
                                    sm={6}
                                    md={4}
                                    lg={3}
                                >
                                    <StyledCard onClick={() => openCardDetail(card)}>
                                        <CardMedia
                                            component="img"
                                            image={card.image}
                                            alt={card.name}
                                            style={{
                                                height: '200px',
                                                objectFit: 'cover',
                                                transform: card.isReversed ? 'rotate(180deg)' : 'none',
                                                transition: 'transform 0.5s ease'
                                            }}
                                        />
                                        <div style={{
                                            position: 'absolute',
                                            bottom: 0,
                                            left: 0,
                                            right: 0,
                                            padding: '1rem',
                                            zIndex: 2
                                        }}>
                                            <Typography
                                                variant="h6"
                                                fontWeight="bold"
                                                color="white"
                                                sx={{ textShadow: '0 2px 4px rgba(0,0,0,0.7)' }}
                                            >
                                                {card.name}
                                            </Typography>
                                            <Typography
                                                variant="subtitle2"
                                                color="white"
                                                sx={{
                                                    textShadow: '0 2px 4px rgba(0,0,0,0.7)',
                                                    opacity: 0.9
                                                }}
                                            >
                                                {selectedSpread.positions[index]?.name}
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                color="white"
                                                sx={{
                                                    textShadow: '0 2px 4px rgba(0,0,0,0.7)',
                                                    opacity: 0.8
                                                }}
                                            >
                                                {card.isReversed ? "逆位" : "正位"}
                                            </Typography>
                                        </div>
                                    </StyledCard>
                                </Grid>
                            ))}
                        </Grid>

                        {/* 显示塔罗牌解读结果 */}
                        {showReadingResult && (
                            <Paper elevation={2} sx={{
                                p: 4,
                                mb: 6,
                                borderRadius: '1rem',
                                backgroundColor: 'white',
                                boxShadow: '0 4px 15px rgba(255, 94, 135, 0.08)'
                            }}>
                                <Typography variant="h6" fontWeight="bold" mb={3} color={COLORS.primary}>
                                    塔罗牌解读
                                </Typography>
                                <Typography variant="body1" sx={{ lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                                    {readingResult}
                                </Typography>
                            </Paper>
                        )}

                        {/* AI解读结果 */}
                        {showAIReading && (
                            <AIReadingCard>
                                <div className="ai-header">
                                    <div className="ai-icon">
                                        <i className="fa fa-lightbulb-o"></i>
                                    </div>
                                    <Typography variant="h6" fontWeight="bold" color={COLORS.primary}>
                                        AI智慧解读
                                    </Typography>
                                </div>

                                {aiLoading ? (
                                    <Box sx={{ py: 4 }}>
                                        <CircularProgress color="primary" size={24} />
                                        <Typography variant="body1" sx={{ mt: 2 }}>
                                            AI正在解读您的塔罗牌，请稍候...
                                        </Typography>
                                    </Box>
                                ) : (
                                    <div className="ai-content">
                                        <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                                            {aiReadingResult}
                                        </Typography>
                                    </div>
                                )}
                            </AIReadingCard>
                        )}

                        {/* 操作按钮 */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Button
                                variant="contained"
                                onClick={showReading}
                                disabled={showReadingResult}
                                sx={{
                                    py: '1rem',
                                    borderRadius: '1rem',
                                    textTransform: 'none',
                                    fontWeight: 'bold',
                                    backgroundColor: COLORS.primary,
                                    boxShadow: '0 8px 20px rgba(255, 94, 135, 0.15)',
                                    '&:hover': {
                                        backgroundColor: COLORS.primaryDark,
                                        boxShadow: '0 10px 25px rgba(255, 94, 135, 0.2)',
                                    }
                                }}
                            >
                                {showReadingResult ? "已查看塔罗解读" : "查看塔罗解读"}
                            </Button>

                            <Button
                                variant="contained"
                                onClick={getAIReading}
                                disabled={aiLoading || !showReadingResult}
                                sx={{
                                    py: '1rem',
                                    borderRadius: '1rem',
                                    textTransform: 'none',
                                    fontWeight: 'bold',
                                    backgroundColor: COLORS.secondary,
                                    boxShadow: '0 8px 20px rgba(255, 165, 105, 0.15)',
                                    '&:hover': {
                                        backgroundColor: COLORS.secondaryDark,
                                        boxShadow: '0 10px 25px rgba(255, 165, 105, 0.2)',
                                    }
                                }}
                            >
                                {aiLoading ? (
                                    <>
                                        <CircularProgress size={18} sx={{ mr: 2 }} />
                                        AI解读中...
                                    </>
                                ) : (
                                    <>
                                        <i className="fa fa-robot mr-2"></i>
                                        获取AI深度解读
                                    </>
                                )}
                            </Button>

                            <Button
                                variant="outlined"
                                onClick={() => setStep(1)}
                                sx={{
                                    py: '1rem',
                                    borderRadius: '1rem',
                                    textTransform: 'none',
                                    fontWeight: 'bold',
                                    borderColor: COLORS.primary,
                                    color: COLORS.primary,
                                    '&:hover': {
                                        backgroundColor: COLORS.primary + '10',
                                        borderColor: COLORS.primaryDark,
                                    }
                                }}
                            >
                                <Refresh sx={{ mr: 2 }} />
                                重新开始
                            </Button>
                        </Box>
                    </Box>
                )}
            </Box>

            {/* 塔罗牌详情对话框 */}
            <CardDetailDialog open={showCardDetail} onClose={closeCardDetail}>
                <DialogTitle sx={{
                    borderBottom: `1px solid ${COLORS.lightPink}`,
                    padding: '1.5rem',
                    fontWeight: 'bold',
                    color: COLORS.dark
                }}>
                    {selectedCard?.name}
                    <Typography
                        variant="subtitle2"
                        color={selectedCard?.isReversed ? COLORS.dark : COLORS.primary}
                        sx={{ mt: 1 }}
                    >
                        {selectedCard?.isReversed ? "逆位" : "正位"}
                    </Typography>
                </DialogTitle>

                <DialogContent sx={{ padding: '1.5rem' }}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={5}>
                            <CardMedia
                                component="img"
                                image={selectedCard?.image}
                                alt={selectedCard?.name}
                                style={{
                                    width: '100%',
                                    borderRadius: '0.75rem',
                                    transform: selectedCard?.isReversed ? 'rotate(180deg)' : 'none',
                                    transition: 'transform 0.5s ease'
                                }}
                            />
                        </Grid>

                        <Grid item xs={12} md={7}>
                            <Typography
                                variant="body1"
                                sx={{
                                    lineHeight: 1.8,
                                    marginBottom: '1.5rem',
                                    color: '#444'
                                }}
                            >
                                {selectedCard?.description}
                            </Typography>

                            <Divider sx={{ margin: '1.5rem 0' }} />

                            <Typography
                                variant="subtitle1"
                                fontWeight="bold"
                                mb={1.5}
                                color={selectedCard?.isReversed ? COLORS.dark : COLORS.primary}
                            >
                                {selectedCard?.isReversed ? "逆位解读" : "正位解读"}
                            </Typography>

                            <Typography
                                variant="body1"
                                sx={{
                                    lineHeight: 1.8,
                                    color: '#444'
                                }}
                            >
                                {selectedCard?.isReversed ? selectedCard?.reversed : selectedCard?.upright}
                            </Typography>
                        </Grid>
                    </Grid>
                </DialogContent>

                <DialogActions sx={{
                    borderTop: `1px solid ${COLORS.lightPink}`,
                    padding: '1.5rem',
                    justifyContent: 'center'
                }}>
                    <Button
                        variant="contained"
                        onClick={closeCardDetail}
                        sx={{
                            borderRadius: '1rem',
                            textTransform: 'none',
                            fontWeight: 'bold',
                            backgroundColor: COLORS.primary,
                            '&:hover': {
                                backgroundColor: COLORS.primaryDark,
                            }
                        }}
                    >
                        关闭
                    </Button>
                </DialogActions>
            </CardDetailDialog>

            {/* 已保存的解读列表对话框 */}
            <Dialog
                open={showSavedReadings}
                onClose={() => setShowSavedReadings(false)}
                maxWidth="lg"
                fullWidth
            >
                <DialogTitle sx={{
                    borderBottom: `1px solid ${COLORS.lightPink}`,
                    padding: '1.5rem',
                    fontWeight: 'bold',
                    color: COLORS.dark
                }}>
                    已保存的解读
                </DialogTitle>

                <DialogContent sx={{ padding: '1.5rem', maxHeight: '70vh', overflowY: 'auto' }}>
                    {savedReadings.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 6 }}>
                            <StarBorder sx={{ fontSize: 64, color: '#ddd', mb: 2 }} />
                            <Typography variant="body1" color="text.secondary">
                                您还没有保存任何解读
                            </Typography>
                            <Typography variant="body2" color="text.secondary" mt={1}>
                            完成占卜后，AI解读会自动保存
                        </Typography>
                        </Box>
                ) : (
                <List>
                    {savedReadings.map(reading => (
                        <ListItem
                            key={reading.id}
                            button
                            onClick={() => {
                                // 恢复解读状态
                                setQuestion(reading.question);
                                setSelectedSpread(spreadTypes.find(s => s.name === reading.spread) || spreadTypes[0]);
                                setCards(reading.cards);
                                setAIReadingResult(reading.reading);
                                setShowAIReading(true);
                                setShowReadingResult(true);
                                setStep(5);
                                setShowSavedReadings(false);
                            }}
                            sx={{
                                borderRadius: '1rem',
                                marginBottom: '1rem',
                                transition: 'all 0.2s',
                                '&:hover': {
                                    backgroundColor: COLORS.lightPink + '20',
                                }
                            }}
                        >
                            <ListItemAvatar>
                                <Avatar
                                    src={reading.cards[0]?.image}
                                    alt={reading.cards[0]?.name}
                                    sx={{
                                        width: 56,
                                        height: 56,
                                        borderRadius: '0.75rem'
                                    }}
                                />
                            </ListItemAvatar>

                            <ListItemText
                                primary={
                                    <React.Fragment>
                                        <Typography variant="h6" fontWeight="bold">
                                            {reading.question}
                                        </Typography>
                                    </React.Fragment>
                                }
                                secondary={
                                    <React.Fragment>
                                        <Typography variant="body2" color="text.secondary">
                                            {reading.spread} | {formatDate(reading.date)}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" mt={1}>
                                            {reading.reading.split('\n')[0]}...
                                        </Typography>
                                    </React.Fragment>
                                }
                            />

                            <Star sx={{ color: COLORS.primary }} />
                        </ListItem>
                    ))}
                </List>
                    )}
            </DialogContent>

            <DialogActions sx={{
                borderTop: `1px solid ${COLORS.lightPink}`,
                padding: '1.5rem',
                justifyContent: 'center'
            }}>
                <Button
                    variant="contained"
                    onClick={() => setShowSavedReadings(false)}
                    sx={{
                        borderRadius: '1rem',
                        textTransform: 'none',
                        fontWeight: 'bold',
                        backgroundColor: COLORS.primary,
                        '&:hover': {
                            backgroundColor: COLORS.primaryDark,
                        }
                    }}
                >
                    关闭
                </Button>
            </DialogActions>
        </Dialog>
            
            {/* 加载中遮罩 */ }
    <Backdrop
        open={isLoading}
        sx={{
            zIndex: 1300,
            color: '#fff',
            backgroundColor: 'rgba(0,0,0,0.2)'
        }}
    >
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
        }}>
            <CircularProgress
                color="primary"
                size={64}
                sx={{ marginBottom: '1rem' }}
            />
            <Typography
                variant="h6"
                fontWeight="bold"
                color="white"
            >
                洗牌中...
            </Typography>
            <Typography
                variant="body1"
                color="white"
                sx={{ opacity: 0.8 }}
            >
                请稍候...
            </Typography>
        </div>
    </Backdrop>

    {/* 提示消息 */ }
    <Snackbar
        open={showSnackbar}
        autoHideDuration={3000}
        onClose={() => setShowSnackbar(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
        <Alert
            onClose={() => setShowSnackbar(false)}
            severity={snackbarSeverity}
            sx={{
                borderRadius: '1rem',
                boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
                backgroundColor: snackbarSeverity === 'success'
                    ? COLORS.primary + '90'
                    : snackbarSeverity === 'error'
                        ? '#f44336'
                        : '#ff9800'
            }}
        >
            {snackbarMessage}
        </Alert>
    </Snackbar>
        </div >
    );
}

export default TarotPage;
