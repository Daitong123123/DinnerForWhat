import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Card,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Pagination,
    Checkbox,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    Select,
    MenuItem,
    Stack,
    Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import apiRequest from './api.js';
import BottomNavigationBar from './BottomNavigationBar.jsx';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';
import COLORS from './constants/color.js';

function UnlikePage() {
    const [unlikes, setUnlikes] = useState([]);
    const [curPage, setCurPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [total, setTotal] = useState(0);
    const [selectedDishes, setSelectedDishes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [likes, setLikes] = useState([]);
    const [likesTotal, setLikesTotal] = useState(0);
    const [likesCurPage, setLikesCurPage] = useState(1);
    const [likesPageSize, setLikesPageSize] = useState(10);
    const [selectedLike, setSelectedLike] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const navigate = useNavigate();
    // 新增筛选相关的状态
    const [dishFromFilter, setDishFromFilter] = useState('');
    const [tastyFilter, setTastyFilter] = useState('');
    const [complexFilter, setComplexFilter] = useState('');
    // 新增筛选选项的状态
    const [dishFromList, setDishFromList] = useState([]);
    const [tastyList, setTastyList] = useState([]);
    const [complexList, setComplexList] = useState([]);

    useEffect(() => {
        const fetchUnlikes = async () => {
            setLoading(true);
            try {
                const formData = {
                    pageSize,
                    curPage
                };
                const response = await apiRequest('/unlike-list', 'POST', formData, navigate);
                if (response) {
                    setUnlikes(response.unlikes);
                    setTotal(response.total);
                } else {
                    console.error('获取不喜欢列表失败');
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchUnlikes();
    }, [curPage, pageSize]);

    useEffect(() => {
        const fetchLikes = async () => {
            setLoading(true);
            try {
                const formData = {
                    curPage: likesCurPage,
                    pageSize: likesPageSize,
                    dishFrom: dishFromFilter,
                    tasty: tastyFilter,
                    complex: complexFilter
                };
                const response = await apiRequest('/query-likes', 'POST', formData, navigate);
                if (response) {
                    setLikes(response.cookBookLikesList);
                    setLikesTotal(response.total);
                } else {
                    console.error('获取收藏列表失败');
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchLikes();
    }, [likesCurPage, likesPageSize, dishFromFilter, tastyFilter, complexFilter]);

    useEffect(() => {
        const fetchLikesOptions = async () => {
            try {
                const response = await apiRequest('/query-likes-options', 'GET', {}, navigate);
                if (response) {
                    setDishFromList(response.dishFromList);
                    setTastyList(response.tastyList);
                    setComplexList(response.compelxList);
                } else {
                    console.error('获取筛选选项失败');
                }
            } catch (error) {
                console.error(error);
            }
        };
        fetchLikesOptions();
    }, []);

    const handleDelete = async () => {
        if (selectedDishes.length === 0) return;
        try {
            const formData = {
                unlikes: selectedDishes
            };
            const response = await apiRequest('/unlike-cancel', 'POST', formData, navigate);
            if (response) {
                setUnlikes(unlikes.filter(dish => !selectedDishes.includes(dish)));
                setSelectedDishes([]);
            } else {
                console.error('删除不喜欢菜品失败');
            }
        } catch (error) {
            console.error(error);
        }
    };
    
    useEffect(() => {
        document.title = '饭菜小记 - 喜好管理';
    }, []);

    const handleDeleteLikes = async () => {
        const selectedLikeIds = likes.filter(like => selectedDishes.includes(like.dishName)).map(like => like.id);
        if (selectedLikeIds.length === 0) return;
        try {
            const response = await apiRequest('/delete-likes', 'POST', selectedLikeIds, navigate);
            if (response) {
                setLikes(likes.filter(like => !selectedLikeIds.includes(like.id)));
                setSelectedDishes([]);
            } else {
                console.error('删除收藏菜品失败');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleSelectAll = (event) => {
        if (event.target.checked) {
            setSelectedDishes([...unlikes, ...likes.map(like => like.dishName)]);
        } else {
            setSelectedDishes([]);
        }
    };

    const handleSelectOne = (event, dish) => {
        if (event.target.checked) {
            setSelectedDishes([...selectedDishes, dish]);
        } else {
            setSelectedDishes(selectedDishes.filter(selected => selected !== dish));
        }
    };

    const handlePageChange = (event, value) => {
        setCurPage(value);
    };

    const handleLikesPageChange = (event, value) => {
        setLikesCurPage(value);
    };

    const handleOpenDialog = (like) => {
        setSelectedLike(like);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    const renderStars = (complex) => {
        const fullStars = Math.floor(complex);
        const hasHalfStar = complex % 1!== 0;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        const starIcons = [];
        for (let i = 0; i < fullStars; i++) {
            starIcons.push(<FaStar key={i} style={{ color: COLORS.primary }} />);
        }
        if (hasHalfStar) {
            starIcons.push(<FaStarHalfAlt key={fullStars} style={{ color: COLORS.primary }} />);
        }
        for (let i = 0; i < emptyStars; i++) {
            starIcons.push(<FaRegStar key={fullStars + (hasHalfStar ? 1 : 0) + i} style={{ color: COLORS.primary }} />);
        }
        return starIcons;
    };

    return (
        <Box sx={{
            minHeight: '100vh',
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            backgroundColor: COLORS.light,
            color: COLORS.dark,
            pb: 20 // 为底部导航栏留出空间
        }}>
            <Card sx={{
                p: 4,
                width: '100%',
                maxWidth: 800,
                boxShadow: '0 4px 20px rgba(255, 94, 135, 0.15)',
                backgroundColor: 'white',
                borderRadius: 16,
                overflow: 'hidden',
                mt: 6
            }}>
                <Typography variant="h4" gutterBottom sx={{
                    background: `linear-gradient(45deg, ${COLORS.primary}, ${COLORS.secondary})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    textFillColor: 'transparent',
                    textAlign: 'center',
                    mb: 6,
                    fontSize: { xs: '2rem', md: '2.5rem' },
                    fontWeight: 'bold'
                }}>
                    喜好管理
                </Typography>
                
                <Button
                    variant="outlined"
                    onClick={() => navigate('/dish')}
                    sx={{ 
                        mb: 6,
                        borderRadius: 100,
                        borderColor: COLORS.primary,
                        color: COLORS.primary,
                        '&:hover': {
                            backgroundColor: 'rgba(255, 94, 135, 0.05)'
                        }
                    }}
                >
                    返回菜品推荐
                </Button>
                
                <Typography variant="h5" sx={{ mb: 4, fontWeight: 'bold', color: COLORS.dark }}>
                    不喜欢的菜品
                </Typography>
                
                <TableContainer component={Paper} sx={{ borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                    <Table sx={{ minWidth: 300 }}>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: 'rgba(255, 94, 135, 0.05)' }}>
                                <TableCell padding="checkbox">
                                    <Checkbox
                                        indeterminate={selectedDishes.length > 0 && selectedDishes.length < unlikes.length}
                                        checked={selectedDishes.length === unlikes.length}
                                        onChange={handleSelectAll}
                                        color="primary"
                                    />
                                </TableCell>
                                <TableCell sx={{ fontWeight: 'bold', color: COLORS.dark }}>菜品名称</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {unlikes.map((dish) => (
                                <TableRow 
                                    key={dish}
                                    sx={{
                                        '&:hover': {
                                            backgroundColor: 'rgba(255, 94, 135, 0.05)'
                                        }
                                    }}
                                >
                                    <TableCell padding="checkbox">
                                        <Checkbox
                                            checked={selectedDishes.includes(dish)}
                                            onChange={(event) => handleSelectOne(event, dish)}
                                            color="primary"
                                        />
                                    </TableCell>
                                    <TableCell>{dish}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                
                <Button
                    variant="contained"
                    color="error"
                    onClick={handleDelete}
                    disabled={selectedDishes.length === 0}
                    sx={{ 
                        mt: 4,
                        borderRadius: 100,
                        py: 2,
                        textTransform: 'none',
                        '&:hover': {
                            backgroundColor: '#FF4778'
                        }
                    }}
                >
                    删除选中不喜欢菜品
                </Button>
                
                <Pagination
                    count={Math.ceil(total / pageSize)}
                    page={curPage}
                    onChange={handlePageChange}
                    sx={{ mt: 6 }}
                    color="primary"
                />
                
                <Divider sx={{ my: 6, borderColor: COLORS.gray }} />
                
                <Typography variant="h5" sx={{ mb: 4, fontWeight: 'bold', color: COLORS.dark }}>
                    收藏的菜品
                </Typography>
                
                {/* 新增筛选选项 */}
                <Stack direction="row" spacing={2} justifyContent="space-between" mb={4}>
                    <Box sx={{ flex: 1 }}>
                        <Typography sx={{ mr: 1, mb: 1, color: COLORS.dark }}>菜系:</Typography>
                        <Select
                            value={dishFromFilter}
                            onChange={(e) => setDishFromFilter(e.target.value)}
                            sx={{ 
                                width: '100%',
                                borderRadius: 16,
                                '& .MuiOutlinedInput-root': {
                                    '&:hover fieldset': {
                                        borderColor: COLORS.primary
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: COLORS.primary
                                    }
                                }
                            }}
                        >
                            <MenuItem value="">全部</MenuItem>
                            {dishFromList.map((dishFrom) => (
                                <MenuItem key={dishFrom} value={dishFrom}>{dishFrom}</MenuItem>
                            ))}
                        </Select>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                        <Typography sx={{ mr: 1, mb: 1, color: COLORS.dark }}>口味:</Typography>
                        <Select
                            value={tastyFilter}
                            onChange={(e) => setTastyFilter(e.target.value)}
                            sx={{ 
                                width: '100%',
                                borderRadius: 16,
                                '& .MuiOutlinedInput-root': {
                                    '&:hover fieldset': {
                                        borderColor: COLORS.primary
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: COLORS.primary
                                    }
                                }
                            }}
                        >
                            <MenuItem value="">全部</MenuItem>
                            {tastyList.map((tasty) => (
                                <MenuItem key={tasty} value={tasty}>{tasty}</MenuItem>
                            ))}
                        </Select>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                        <Typography sx={{ mr: 1, mb: 1, color: COLORS.dark }}>难度:</Typography>
                        <Select
                            value={complexFilter}
                            onChange={(e) => setComplexFilter(e.target.value)}
                            sx={{ 
                                width: '100%',
                                borderRadius: 16,
                                '& .MuiOutlinedInput-root': {
                                    '&:hover fieldset': {
                                        borderColor: COLORS.primary
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: COLORS.primary
                                    }
                                }
                            }}
                        >
                            <MenuItem value="">全部</MenuItem>
                            {complexList.map((complex) => (
                                <MenuItem key={complex} value={complex}>{complex}</MenuItem>
                            ))}
                        </Select>
                    </Box>
                </Stack>
                
                <TableContainer component={Paper} sx={{ borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                    <Table sx={{ minWidth: 300 }}>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: 'rgba(255, 94, 135, 0.05)' }}>
                                <TableCell padding="checkbox">
                                    <Checkbox
                                        indeterminate={selectedDishes.length > 0 && selectedDishes.length < likes.length}
                                        checked={selectedDishes.length === likes.length}
                                        onChange={handleSelectAll}
                                        color="primary"
                                    />
                                </TableCell>
                                <TableCell sx={{ fontWeight: 'bold', color: COLORS.dark }}>菜品名称</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', color: COLORS.dark }}>菜系</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', color: COLORS.dark }}>口味</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', color: COLORS.dark }}>制作难度</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', color: COLORS.dark }}>详情</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {likes.map((like) => (
                                <TableRow 
                                    key={like.id}
                                    sx={{
                                        '&:hover': {
                                            backgroundColor: 'rgba(255, 94, 135, 0.05)'
                                        }
                                    }}
                                >
                                    <TableCell padding="checkbox">
                                        <Checkbox
                                            checked={selectedDishes.includes(like.dishName)}
                                            onChange={(event) => handleSelectOne(event, like.dishName)}
                                            color="primary"
                                        />
                                    </TableCell>
                                    <TableCell>{like.dishName}</TableCell>
                                    <TableCell>{like.dishFrom}</TableCell>
                                    <TableCell>{like.tasty}</TableCell>
                                    <TableCell>{renderStars(like.complex)}</TableCell>
                                    <TableCell>
                                        <Typography
                                            color={COLORS.primary}
                                            sx={{ 
                                                cursor: 'pointer',
                                                fontWeight: 'bold',
                                                '&:hover': {
                                                    textDecoration: 'underline'
                                                }
                                            }}
                                            onClick={() => handleOpenDialog(like)}
                                        >
                                            详情
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                
                <Button
                    variant="contained"
                    color="error"
                    onClick={handleDeleteLikes}
                    disabled={selectedDishes.length === 0}
                    sx={{ 
                        mt: 4,
                        borderRadius: 100,
                        py: 2,
                        textTransform: 'none',
                        '&:hover': {
                            backgroundColor: '#FF4778'
                        }
                    }}
                >
                    删除选中收藏菜品
                </Button>
                
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 6 }}>
                    <Pagination
                        count={Math.ceil(likesTotal / likesPageSize)}
                        page={likesCurPage}
                        onChange={handleLikesPageChange}
                        color="primary"
                    />
                    <Typography sx={{ ml: 2, color: COLORS.dark }}>
                        第 {likesCurPage} 页，共 {Math.ceil(likesTotal / likesPageSize)} 页
                    </Typography>
                </Box>
            </Card>
            
            <Dialog 
                open={openDialog} 
                onClose={handleCloseDialog} 
                maxWidth="md" 
                fullWidth
                sx={{
                    '& .MuiDialog-paper': {
                        width: '90%',
                        maxWidth: 'none',
                        margin: '16px',
                        borderRadius: 16,
                        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
                        '@media (max-width: 600px)': {
                            width: '95%',
                            margin: '8px'
                        }
                    }
                }}
            >
                <Card sx={{
                    p: { xs: 4, sm: 6 },
                    width: '100%',
                    boxShadow: '0 4px 20px rgba(255, 94, 135, 0.15)',
                    backgroundColor: 'white',
                    borderRadius: 16,
                    overflow: 'hidden'
                }}>
                    {selectedLike && (
                        <>
                            <Typography variant="h4" gutterBottom sx={{
                                background: `linear-gradient(45deg, ${COLORS.primary}, ${COLORS.secondary})`,
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                                textFillColor: 'transparent',
                                textAlign: 'center',
                                mb: 6,
                                fontSize: { xs: '1.8rem', sm: '2.125rem' },
                                fontWeight: 'bold'
                            }}>
                                {selectedLike.dishName}
                            </Typography>
                            
                            <Stack spacing={{ xs: 3, sm: 4 }}>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 2, sm: 4 }, mb: 4 }}>
                                    <Typography variant="body1" sx={{ 
                                        color: COLORS.dark,
                                        backgroundColor: 'rgba(255, 94, 135, 0.1)',
                                        borderRadius: 100,
                                        px: 3,
                                        py: 1
                                    }}>
                                        <span style={{ color: COLORS.primary, fontWeight: 'bold' }}>菜系:</span> {selectedLike.dishFrom}
                                    </Typography>
                                    <Typography variant="body1" sx={{ 
                                        color: COLORS.dark,
                                        backgroundColor: 'rgba(255, 94, 135, 0.1)',
                                        borderRadius: 100,
                                        px: 3,
                                        py: 1
                                    }}>
                                        <span style={{ color: COLORS.primary, fontWeight: 'bold' }}>口味:</span> {selectedLike.tasty}
                                    </Typography>
                                    <Typography variant="body1" sx={{ 
                                        color: COLORS.dark,
                                        backgroundColor: 'rgba(255, 94, 135, 0.1)',
                                        borderRadius: 100,
                                        px: 3,
                                        py: 1
                                    }}>
                                        <span style={{ color: COLORS.primary, fontWeight: 'bold' }}>制作难度:</span> {renderStars(selectedLike.complex)}
                                    </Typography>
                                </Box>
                                
                                <Divider sx={{ borderColor: COLORS.gray }} />
                                
                                <Typography variant="h6" sx={{ color: COLORS.primary, fontWeight: 'bold', mb: 2 }}>
                                    制作步骤
                                </Typography>
                                
                                <Typography variant="body1" sx={{ 
                                    whiteSpace: 'pre-wrap',
                                    color: COLORS.dark,
                                    lineHeight: 1.8,
                                    backgroundColor: 'rgba(255, 94, 135, 0.05)',
                                    borderRadius: 8,
                                    p: 3
                                }}>
                                    {selectedLike.dishStep}
                                </Typography>
                                
                                <Divider sx={{ borderColor: COLORS.gray }} />
                                
                                {selectedLike.dishEffect && (
                                    <>
                                        <Typography variant="h6" sx={{ color: COLORS.primary, fontWeight: 'bold', mb: 2 }}>
                                            功效
                                        </Typography>
                                        <Typography variant="body1" sx={{ 
                                            whiteSpace: 'pre-wrap',
                                            color: COLORS.dark,
                                            lineHeight: 1.8,
                                            backgroundColor: 'rgba(255, 94, 135, 0.05)',
                                            borderRadius: 8,
                                            p: 3
                                        }}>
                                            {selectedLike.dishEffect}
                                        </Typography>
                                        <Divider sx={{ borderColor: COLORS.gray }} />
                                    </>
                                )}
                                
                                {selectedLike.dishIngredients && (
                                    <>
                                        <Typography variant="h6" sx={{ color: COLORS.primary, fontWeight: 'bold', mb: 2 }}>
                                            食材
                                        </Typography>
                                        <Typography variant="body1" sx={{ 
                                            whiteSpace: 'pre-wrap',
                                            color: COLORS.dark,
                                            lineHeight: 1.8,
                                            backgroundColor: 'rgba(255, 94, 135, 0.05)',
                                            borderRadius: 8,
                                            p: 3
                                        }}>
                                            {selectedLike.dishIngredients}
                                        </Typography>
                                        <Divider sx={{ borderColor: COLORS.gray }} />
                                    </>
                                )}
                                
                                {selectedLike.dishCost && (
                                    <>
                                        <Typography variant="h6" sx={{ color: COLORS.primary, fontWeight: 'bold', mb: 2 }}>
                                            花费
                                        </Typography>
                                        <Typography variant="body1" sx={{ 
                                            whiteSpace: 'pre-wrap',
                                            color: COLORS.dark,
                                            lineHeight: 1.8,
                                            backgroundColor: 'rgba(255, 94, 135, 0.05)',
                                            borderRadius: 8,
                                            p: 3
                                        }}>
                                            {selectedLike.dishCost}
                                        </Typography>
                                    </>
                                )}
                            </Stack>
                            
                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
                                <Button
                                    variant="contained"
                                    onClick={handleCloseDialog}
                                    sx={{
                                        borderRadius: 100,
                                        px: 8,
                                        py: 2,
                                        textTransform: 'none',
                                        background: `linear-gradient(45deg, ${COLORS.primary}, ${COLORS.secondary})`,
                                        boxShadow: `0 4px 15px rgba(255, 94, 135, 0.3)`,
                                        '&:hover': {
                                            background: `linear-gradient(45deg, ${COLORS.secondary}, ${COLORS.primary})`,
                                            boxShadow: `0 6px 20px rgba(255, 94, 135, 0.4)`
                                        }
                                    }}
                                >
                                    关闭详情
                                </Button>
                            </Box>
                        </>
                    )}
                </Card>
            </Dialog>
            
            <BottomNavigationBar />
        </Box>
    );
}

export default UnlikePage;    