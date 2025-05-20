import React, { useState } from 'react';
import {
    Grid,
    Typography,
    Box,
    Button,
    Card,
    CardContent,
    CardMedia,
    Modal,
    AppBar,
    Toolbar,
    IconButton,
    CircularProgress,
    Backdrop
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import BottomNavigationBar from '../BottomNavigationBar.jsx';
import Layout from '../Layout.jsx';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import { styled } from '@mui/system';
import COLORS from '../constants/color.js';

// 塔罗牌数据
const tarotCards = [
    {
        id: 1,
        name: '恋人',
        image: 'https://picsum.photos/seed/lovers/400/600',
        upright: '恋爱、选择、结合',
        reversed: '关系疏远、犹豫不决、分离',
        description: '恋人牌代表选择、爱情和关系。正位时表示和谐的爱情和重大抉择，逆位则可能暗示关系中的挑战或分离。'
    },
    {
        id: 2,
        name: '星星',
        image: 'https://picsum.photos/seed/star/400/600',
        upright: '希望、灵感、信心',
        reversed: '失望、缺乏信心、能量流失',
        description: '星星牌象征希望与乐观。正位时代表对未来的信心和灵感，逆位则可能表示希望破灭或暂时的迷茫。'
    },
    {
        id: 3,
        name: '月亮',
        image: 'https://picsum.photos/seed/moon/400/600',
        upright: '潜意识、梦想、直觉',
        reversed: '混乱、恐惧、误解',
        description: '月亮牌关联潜意识和情感。正位表示直觉敏锐和灵性成长，逆位则可能暗示困惑、不安或欺骗。'
    },
    {
        id: 4,
        name: '太阳',
        image: 'https://picsum.photos/seed/sun/400/600',
        upright: '成功、喜悦、活力',
        reversed: '消沉、不成熟、任性',
        description: '太阳牌代表成功与幸福。正位时象征光明的未来和积极的能量，逆位则可能表示暂时的挫折或自我中心。'
    },
    {
        id: 5,
        name: '命运之轮',
        image: 'https://picsum.photos/seed/fate/400/600',
        upright: '命运变化、转机、机会',
        reversed: '停滞、抗拒变化、厄运',
        description: '命运之轮代表变化与周期。正位时表示命运的转变和新机会，逆位则可能暗示抗拒变化或陷入困境。'
    },
    {
        id: 6,
        name: '恋人',
        image: 'https://picsum.photos/seed/lovers2/400/600',
        upright: '爱情、和谐、平衡',
        reversed: '关系问题、失衡、选择困难',
        description: '恋人牌再次出现，强调关系和选择的重要性。正位表示和谐的伴侣关系，逆位则可能暗示关系中的冲突或需要重新评估。'
    }
];

// 自定义卡片样式
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

// 塔罗牌背面样式
const CardBack = styled(CardMedia)(({ theme }) => ({
    height: '200px',
    background: 'linear-gradient(135deg, #FF5E87 0%, #9D50BB 100%)',
    borderRadius: '1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '&:before': {
        content: '"塔罗牌"',
        color: 'white',
        fontSize: '1.5rem',
        fontWeight: 'bold',
        textShadow: '0 2px 4px rgba(0,0,0,0.3)',
    }
}));

// 塔罗牌正面样式
const CardFront = styled(CardMedia)(({ theme }) => ({
    height: '200px',
    borderRadius: '1rem',
}));

// 塔罗牌详情模态框
const TarotModal = styled(Modal)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
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

function TarotPage() {
    const navigate = useNavigate();
    const [selectedCard, setSelectedCard] = useState(null);
    const [showCards, setShowCards] = useState(false);
    const [selectedCards, setSelectedCards] = useState([]);
    const [loading, setLoading] = useState(false);

    // 洗牌并选择三张牌
    const shuffleCards = () => {
        setLoading(true);
        setShowCards(false);
        
        // 模拟洗牌过程
        setTimeout(() => {
            // 随机选择三张牌
            const shuffled = [...tarotCards].sort(() => 0.5 - Math.random());
            const selected = shuffled.slice(0, 3);
            
            // 随机设置正逆位
            const cardsWithPosition = selected.map(card => ({
                ...card,
                isReversed: Math.random() > 0.5
            }));
            
            setSelectedCards(cardsWithPosition);
            setShowCards(true);
            setLoading(false);
        }, 2000);
    };

    // 打开卡片详情
    const openCardDetail = (card) => {
        setSelectedCard(card);
    };

    // 关闭卡片详情
    const closeCardDetail = () => {
        setSelectedCard(null);
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
                        塔罗牌占卜
                    </Typography>
                    <Box sx={{ width: 24 }} /> {/* 保持布局对称 */}
                </Toolbar>
            </AppBar>

            <Box sx={{ p: 3, minHeight: 'calc(100vh - 112px)', backgroundColor: COLORS.lightPink }}>
                {/* 介绍卡片 */}
                <Card sx={{ borderRadius: '1rem', mb: 4, overflow: 'hidden' }}>
                    <CardMedia
                        component="img"
                        height="180"
                        image="https://picsum.photos/seed/tarotbg/800/400"
                        alt="塔罗牌背景"
                    />
                    <CardContent sx={{ backgroundColor: 'white', padding: '1.5rem' }}>
                        <Typography variant="h6" fontWeight="bold" mb={2} color={COLORS.dark}>
                            爱情塔罗占卜
                        </Typography>
                        <Typography variant="body2" color="#666">
                            选择三张塔罗牌，探索你和TA的爱情关系，获取指引和启示。每一张牌都代表不同的方面：过去、现在和未来。
                        </Typography>
                    </CardContent>
                </Card>

                {/* 洗牌按钮 */}
                {!showCards && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 6 }}>
                        <StyledButton onClick={shuffleCards} disabled={loading}>
                            {loading ? (
                                <>
                                    <CircularProgress size={24} color="inherit" sx={{ mr: 2 }} />
                                    洗牌中...
                                </>
                            ) : (
                                '开始占卜'
                            )}
                        </StyledButton>
                    </Box>
                )}

                {/* 塔罗牌区域 */}
                {showCards && (
                    <Box sx={{ my: 4 }}>
                        <Typography variant="h6" fontWeight="bold" mb={4} textAlign="center" color={COLORS.dark}>
                            你的牌面
                        </Typography>
                        <Grid container spacing={3} justifyContent="center">
                            {selectedCards.map((card, index) => (
                                <Grid item key={card.id} xs={12} sm={4} sx={{ display: 'flex', justifyContent: 'center' }}>
                                    <StyledCard onClick={() => openCardDetail(card)}>
                                        <CardFront
                                            component="img"
                                            image={card.image}
                                            alt={card.name}
                                        />
                                        <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, p: 2, zIndex: 2 }}>
                                            <Typography variant="subtitle1" fontWeight="bold" color="white">
                                                {card.name}
                                                {card.isReversed && <span style={{ marginLeft: 4, fontSize: '0.8rem' }}>(逆位)</span>}
                                            </Typography>
                                            <Typography variant="body2" color="white" opacity={0.8}>
                                                {card.isReversed ? card.reversed : card.upright}
                                            </Typography>
                                        </Box>
                                    </StyledCard>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                )}

                {/* 重新占卜按钮 */}
                {showCards && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 6 }}>
                        <StyledButton onClick={shuffleCards}>
                            重新占卜
                        </StyledButton>
                    </Box>
                )}
            </Box>

            {/* 塔罗牌详情模态框 */}
            <TarotModal
                open={selectedCard !== null}
                onClose={closeCardDetail}
                aria-labelledby="tarot-modal-title"
                aria-describedby="tarot-modal-description"
            >
                <Card sx={{ width: '90%', maxWidth: '500px', borderRadius: '1rem', overflow: 'hidden' }}>
                    <CardMedia
                        component="img"
                        height="300"
                        image={selectedCard?.image || ''}
                        alt={selectedCard?.name || ''}
                    />
                    <CardContent sx={{ padding: '1.5rem' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h5" fontWeight="bold" color={COLORS.dark} id="tarot-modal-title">
                                {selectedCard?.name || ''}
                                {selectedCard?.isReversed && <span style={{ marginLeft: 4, fontSize: '0.8rem', color: COLORS.secondary }}>(逆位)</span>}
                            </Typography>
                            <IconButton onClick={closeCardDetail} color="primary">
                                <i className="fa fa-times"></i>
                            </IconButton>
                        </Box>
                        <Typography variant="subtitle1" color={COLORS.primary} mb={2}>
                            {selectedCard?.isReversed ? selectedCard?.reversed : selectedCard?.upright}
                        </Typography>
                        <Typography variant="body2" color="#666" id="tarot-modal-description">
                            {selectedCard?.description || ''}
                        </Typography>
                    </CardContent>
                </Card>
            </TarotModal>

            <BottomNavigationBar />
        </Layout>
    );
}

export default TarotPage;    