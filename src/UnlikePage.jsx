import React, { useState, useEffect } from'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
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
import { useNavigate } from'react-router-dom';
import apiRequest from './api.js';
import BottomNavigationBar from './BottomNavigationBar.jsx';
import { FaStar, FaStarHalfAlt, FaRegStar } from'react-icons/fa';

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
                setUnlikes(unlikes.filter(dish =>!selectedDishes.includes(dish)));
                setSelectedDishes([]);
            } else {
                console.error('删除不喜欢菜品失败');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteLikes = async () => {
        const selectedLikeIds = likes.filter(like => selectedDishes.includes(like.dishName)).map(like => like.id);
        if (selectedLikeIds.length === 0) return;
        try {
            const formData = {
                deleteList: selectedLikeIds
            };
            const response = await apiRequest('/delete-likes', 'POST', formData, navigate);
            if (response) {
                setLikes(likes.filter(like =>!selectedLikeIds.includes(like.id)));
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
            setSelectedDishes([...unlikes,...likes.map(like => like.dishName)]);
        } else {
            setSelectedDishes([]);
        }
    };

    const handleSelectOne = (event, dish) => {
        if (event.target.checked) {
            setSelectedDishes([...selectedDishes, dish]);
        } else {
            setSelectedDishes(selectedDishes.filter(selected => selected!== dish));
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
            starIcons.push(<FaStar key={i} style={{ color: 'gold' }} />);
        }
        if (hasHalfStar) {
            starIcons.push(<FaStarHalfAlt key={fullStars} style={{ color: 'gold' }} />);
        }
        for (let i = 0; i < emptyStars; i++) {
            starIcons.push(<FaRegStar key={fullStars + (hasHalfStar ? 1 : 0) + i} style={{ color: 'gold' }} />);
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
            justifyContent: 'center',
            backgroundColor: '#f4f4f4',
            color: '#333',
            pb: 6 // 添加底部内边距，根据实际情况调整数值
        }}>
            <Card sx={{
                p: 3,
                width: '100%',
                maxWidth: 600,
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                backgroundColor: '#fff',
                borderRadius: 10,
                overflow: 'hidden'
            }}>
                <Typography variant="h4" gutterBottom sx={{
                    background: 'linear-gradient(45deg, #FF6F61, #FFB142)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    textFillColor: 'transparent',
                    textAlign: 'center',
                    mb: 3
                }}>
                    喜好管理
                </Typography>
                <Button
                    variant="outlined"
                    onClick={() => navigate('/dish')}
                    sx={{ mb: 2 }}
                >
                    返回菜品推荐
                </Button>
                <Typography variant="h6" sx={{ mb: 2 }}>
                    不喜欢的菜品
                </Typography>
                <TableContainer component={Paper} sx={{ borderRadius: 8, overflow: 'hidden' }}>
                    <Table sx={{ minWidth: 300 }}>
                        <TableHead>
                            <TableRow>
                                <TableCell padding="checkbox">
                                    <Checkbox
                                        indeterminate={selectedDishes.length > 0 && selectedDishes.length < unlikes.length}
                                        checked={selectedDishes.length === unlikes.length}
                                        onChange={handleSelectAll}
                                    />
                                </TableCell>
                                <TableCell>菜品名称</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {unlikes.map((dish) => (
                                <TableRow key={dish}>
                                    <TableCell padding="checkbox">
                                        <Checkbox
                                            checked={selectedDishes.includes(dish)}
                                            onChange={(event) => handleSelectOne(event, dish)}
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
                    sx={{ mt: 2 }}
                >
                    删除选中不喜欢菜品
                </Button>
                <Pagination
                    count={Math.ceil(total / pageSize)}
                    page={curPage}
                    onChange={handlePageChange}
                    sx={{ mt: 2 }}
                />
                <Divider sx={{ my: 3 }} />
                <Typography variant="h6" sx={{ mb: 2 }}>
                    收藏的菜品
                </Typography>
                {/* 新增筛选选项 */}
                <Stack direction="row" spacing={2} justifyContent="space-between" mb={2}>
                    <Box sx={{ flex: 1 }}>
                        <Typography sx={{ mr: 1 }}>菜系:</Typography>
                        <Select
                            value={dishFromFilter}
                            onChange={(e) => setDishFromFilter(e.target.value)}
                            sx={{ width: '100%' }}
                        >
                            <MenuItem value="">全部</MenuItem>
                            {dishFromList.map((dishFrom) => (
                                <MenuItem key={dishFrom} value={dishFrom}>{dishFrom}</MenuItem>
                            ))}
                        </Select>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                        <Typography sx={{ mr: 1 }}>口味:</Typography>
                        <Select
                            value={tastyFilter}
                            onChange={(e) => setTastyFilter(e.target.value)}
                            sx={{ width: '100%' }}
                        >
                            <MenuItem value="">全部</MenuItem>
                            {tastyList.map((tasty) => (
                                <MenuItem key={tasty} value={tasty}>{tasty}</MenuItem>
                            ))}
                        </Select>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                        <Typography sx={{ mr: 1 }}>难度:</Typography>
                        <Select
                            value={complexFilter}
                            onChange={(e) => setComplexFilter(e.target.value)}
                            sx={{ width: '100%' }}
                        >
                            <MenuItem value="">全部</MenuItem>
                            {complexList.map((complex) => (
                                <MenuItem key={complex} value={complex}>{complex}</MenuItem>
                            ))}
                        </Select>
                    </Box>
                </Stack>
                <TableContainer component={Paper} sx={{ borderRadius: 8, overflow: 'hidden' }}>
                    <Table sx={{ minWidth: 300 }}>
                        <TableHead>
                            <TableRow>
                                <TableCell padding="checkbox">
                                    <Checkbox
                                        indeterminate={selectedDishes.length > 0 && selectedDishes.length < likes.length}
                                        checked={selectedDishes.length === likes.length}
                                        onChange={handleSelectAll}
                                    />
                                </TableCell>
                                <TableCell>菜品名称</TableCell>
                                <TableCell>菜系</TableCell>
                                <TableCell>口味</TableCell>
                                <TableCell>制作难度</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {likes.map((like) => (
                                <TableRow key={like.id}>
                                    <TableCell padding="checkbox">
                                        <Checkbox
                                            checked={selectedDishes.includes(like.dishName)}
                                            onChange={(event) => handleSelectOne(event, like.dishName)}
                                        />
                                    </TableCell>
                                    <TableCell>{like.dishName}</TableCell>
                                    <TableCell>{like.dishFrom}</TableCell>
                                    <TableCell>{like.tasty}</TableCell>
                                    <TableCell>{renderStars(like.complex)}</TableCell>
                                    <TableCell>
                                        <Typography
                                            color="primary"
                                            sx={{ cursor: 'pointer' }}
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
                    sx={{ mt: 2 }}
                >
                    删除选中收藏菜品
                </Button>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 2 }}>
                    <Pagination
                        count={Math.ceil(likesTotal / likesPageSize)}
                        page={likesCurPage}
                        onChange={handleLikesPageChange}
                    />
                    <Typography sx={{ ml: 2 }}>
                        第 {likesCurPage} 页，共 {Math.ceil(likesTotal / likesPageSize)} 页
                    </Typography>
                </Box>
            </Card>
            <Dialog open={openDialog} onClose={handleCloseDialog}
                sx={{
                    '&.MuiPaper-root': {
                        backgroundImage: 'url("https://example.com/book-background.jpg")', // 替换为真实的书本背景图片地址
                        backgroundSize: 'cover',
                        borderRadius: 10,
                        boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)'
                    }
                }}>
                <DialogTitle sx={{ fontFamily: '楷体' }}>菜品详情</DialogTitle>
                <DialogContent sx={{ fontFamily: '楷体' }}>
                    {selectedLike && (
                        <>
                            <DialogContentText>
                                <strong>菜品名称:</strong> {selectedLike.dishName}
                            </DialogContentText>
                            <DialogContentText>
                                <strong>菜系:</strong> {selectedLike.dishFrom}
                            </DialogContentText>
                            <DialogContentText>
                                <strong>口味:</strong> {selectedLike.tasty}
                            </DialogContentText>
                            <DialogContentText>
                                <strong>制作难度:</strong> {renderStars(selectedLike.complex)}
                            </DialogContentText>
                            <DialogContentText>
                                <strong>制作步骤:</strong>
                                <pre style={{ whiteSpace: 'pre-wrap' }}>{selectedLike.dishStep}</pre>
                            </DialogContentText>
                            <DialogContentText>
                                <strong>功效:</strong> {selectedLike.dishEffect}
                            </DialogContentText>
                        </>
                    )}
                </DialogContent>
            </Dialog>
            <BottomNavigationBar />
        </Box>
    );
}

export default UnlikePage;