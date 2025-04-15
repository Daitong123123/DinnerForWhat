import React, { useState, useEffect } from'react';
import { Box, Typography, Card, CardContent, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Pagination, Checkbox } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import apiRequest from './api.js';

function UnlikePage() {
    const [unlikes, setUnlikes] = useState([]);
    const [curPage, setCurPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [total, setTotal] = useState(0);
    const [selectedDishes, setSelectedDishes] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

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

    const handleSelectAll = (event) => {
        if (event.target.checked) {
            setSelectedDishes(unlikes);
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

    return (
        <Box sx={{
            minHeight: '100vh',
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #FFE4B5, #FFECD1)',
            color: '#333'
        }}>
            <Card sx={{
                p: 4,
                width: '100%',
                maxWidth: 500,
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                background: '#fff',
                borderRadius: 8,
                border: '1px solid #ccc'
            }}>
                <Typography variant="h4" gutterBottom sx={{
                    background: 'linear-gradient(45deg, #FF6F61, #FFB142)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    textFillColor: 'transparent',
                    textAlign: 'center',
                    mb: 4
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
                <TableContainer component={Paper}>
                    <Table>
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
                    删除选中菜品
                </Button>
                <Pagination
                    count={Math.ceil(total / pageSize)}
                    page={curPage}
                    onChange={handlePageChange}
                    sx={{ mt: 2 }}
                />
            </Card>
        </Box>
    );
}

export default UnlikePage;
    