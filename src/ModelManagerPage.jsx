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
import apiRequest from './api.js'; // 假设这是处理 API 请求的函数，需根据实际情况实现
import BottomNavigationBar from './BottomNavigationBar.jsx'; // 底部导航栏组件，可根据实际情况实现

function ModelManagementPage() {
    const [modelConfigs, setModelConfigs] = useState([]);
    const [curPage, setCurPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(0);
    const [selectedConfigs, setSelectedConfigs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modelTypes, setModelTypes] = useState([]);
    const [currentModel, setCurrentModel] = useState(null);
    const [editModel, setEditModel] = useState(null);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const navigate = useNavigate();

    // 获取模型类型列表
    useEffect(() => {
        const fetchModelTypes = async () => {
            try {
                const response = await apiRequest('/admin/model-type-list', 'GET', {}, navigate);
                if (response && response.data) {
                    setModelTypes(response.data);
                } else {
                    console.error('获取模型类型列表失败');
                }
            } catch (error) {
                console.error(error);
            }
        };
        fetchModelTypes();
    }, [navigate]);

    // 获取当前使用的模型
    useEffect(() => {
        const fetchCurrentModel = async () => {
            try {
                const response = await apiRequest('/admin/model-current', 'GET', {}, navigate);
                if (response && response.data) {
                    setCurrentModel(response.data);
                } else {
                    console.error('获取当前模型失败');
                }
            } catch (error) {
                console.error(error);
            }
        };
        fetchCurrentModel();
    }, [navigate]);

    // 根据模型类型获取模型列表
    const fetchModelsByType = async (type) => {
        try {
            const response = await apiRequest('/admin/model-list-by-type', 'GET', { modelType: type }, navigate);
            if (response && response.data) {
                setModelConfigs(response.data);
            } else {
                console.error('获取模型列表失败');
            }
        } catch (error) {
            console.error(error);
        }
    };

    // 获取所有模型的分页列表
    useEffect(() => {
        const fetchModelList = async () => {
            setLoading(true);
            try {
                const formData = {
                    curPage,
                    pageSize
                };
                const response = await apiRequest('/admin/model-list', 'POST', formData, navigate);
                if (response) {
                    setModelConfigs(response.data);
                    setTotal(response.total);
                } else {
                    console.error('获取模型列表失败');
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchModelList();
    }, [curPage, pageSize, navigate]);

    // 切换当前使用的模型
    const handleSwitchModel = async (modelType, model) => {
        try {
            const response = await apiRequest('/admin/switch-model', 'GET', { modelType, model }, navigate);
            if (response) {
                // 切换成功后更新当前模型状态
                const newCurrentModel = modelConfigs.find(m => m.modelType === modelType && m.model === model);
                setCurrentModel(newCurrentModel);
            } else {
                console.error('切换模型失败');
            }
        } catch (error) {
            console.error(error);
        }
    };

    // 添加模型
    const handleAddModel = async (modelConfig) => {
        try {
            const response = await apiRequest('/admin/add-model', 'POST', modelConfig, navigate);
            if (response) {
                // 添加成功后刷新模型列表
                const formData = {
                    curPage,
                    pageSize
                };
                const newResponse = await apiRequest('/admin/model-list', 'POST', formData, navigate);
                setModelConfigs(newResponse.data);
                setTotal(newResponse.total);
            } else {
                console.error('添加模型失败');
            }
        } catch (error) {
            console.error(error);
        }
    };

    // 更新模型
    const handleUpdateModel = async (modelConfig) => {
        try {
            const response = await apiRequest('/admin/update-model', 'POST', modelConfig, navigate);
            if (response) {
                // 更新成功后刷新模型列表
                const formData = {
                    curPage,
                    pageSize
                };
                const newResponse = await apiRequest('/admin/model-list', 'POST', formData, navigate);
                setModelConfigs(newResponse.data);
                setTotal(newResponse.total);
                setOpenEditDialog(false);
            } else {
                console.error('更新模型失败');
            }
        } catch (error) {
            console.error(error);
        }
    };

    // 删除模型
    const handleDeleteModel = async () => {
        if (selectedConfigs.length === 0) return;
        const ids = selectedConfigs.map(config => config.id);
        try {
            const response = await apiRequest('/admin/delete-model', 'POST', { deleteList: ids }, navigate);
            if (response) {
                // 删除成功后刷新模型列表
                const formData = {
                    curPage,
                    pageSize
                };
                const newResponse = await apiRequest('/admin/model-list', 'POST', formData, navigate);
                setModelConfigs(newResponse.data);
                setTotal(newResponse.total);
                setSelectedConfigs([]);
            } else {
                console.error('删除模型失败');
            }
        } catch (error) {
            console.error(error);
        }
    };

    // 全选/全不选模型
    const handleSelectAll = (event) => {
        if (event.target.checked) {
            setSelectedConfigs([...modelConfigs]);
        } else {
            setSelectedConfigs([]);
        }
    };

    // 单选模型
    const handleSelectOne = (event, config) => {
        if (event.target.checked) {
            setSelectedConfigs([...selectedConfigs, config]);
        } else {
            setSelectedConfigs(selectedConfigs.filter(selected => selected.id!== config.id));
        }
    };

    // 分页变化处理
    const handlePageChange = (event, value) => {
        setCurPage(value);
    };

    // 打开编辑对话框
    const handleOpenEditDialog = (config) => {
        setEditModel({...config });
        setOpenEditDialog(true);
    };

    // 关闭编辑对话框
    const handleCloseEditDialog = () => {
        setEditModel(null);
        setOpenEditDialog(false);
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
            pb: 6
        }}>
            <Card sx={{
                p: 3,
                width: '100%',
                maxWidth: 800,
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                backgroundColor: '#fff',
                borderRadius: 10,
                overflow: 'hidden'
            }}>
                <Typography variant="h4" gutterBottom sx={{
                    background: 'linear-gradient(45deg, #64B5F6, #42A5F5)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    textFillColor: 'transparent',
                    textAlign: 'center',
                    mb: 3
                }}>
                    大模型管理
                </Typography>
                <Button
                    variant="outlined"
                    onClick={() => navigate('/')}
                    sx={{ mb: 2 }}
                >
                    返回首页
                </Button>
                <Typography variant="h6" sx={{ mb: 2 }}>
                    当前使用的模型
                </Typography>
                {currentModel && (
                    <Typography sx={{ mb: 2 }}>
                        模型类型: {currentModel.modelType}，模型: {currentModel.model}
                    </Typography>
                )}
                <Divider sx={{ my: 3 }} />
                <Typography variant="h6" sx={{ mb: 2 }}>
                    模型列表
                </Typography>
                <Stack direction="row" spacing={2} justifyContent="space-between" mb={2}>
                    <Box sx={{ flex: 1 }}>
                        <Typography sx={{ mr: 1 }}>模型类型:</Typography>
                        <Select
                            value=""
                            onChange={(e) => fetchModelsByType(e.target.value)}
                            sx={{ width: '100%' }}
                        >
                            <MenuItem value="">全部</MenuItem>
                            {modelTypes.map(type => (
                                <MenuItem key={type} value={type}>{type}</MenuItem>
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
                                        indeterminate={selectedConfigs.length > 0 && selectedConfigs.length < modelConfigs.length}
                                        checked={selectedConfigs.length === modelConfigs.length}
                                        onChange={handleSelectAll}
                                    />
                                </TableCell>
                                <TableCell>模型类型</TableCell>
                                <TableCell>模型</TableCell>
                                <TableCell>模型名称</TableCell>
                                <TableCell>操作</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {modelConfigs.map(config => (
                                <TableRow key={config.id}>
                                    <TableCell padding="checkbox">
                                        <Checkbox
                                            checked={selectedConfigs.some(selected => selected.id === config.id)}
                                            onChange={(event) => handleSelectOne(event, config)}
                                        />
                                    </TableCell>
                                    <TableCell>{config.modelType}</TableCell>
                                    <TableCell>{config.model}</TableCell>
                                    <TableCell>{config.modelName}</TableCell>
                                    <TableCell>
                                        <Button
                                            variant="outlined"
                                            color="primary"
                                            onClick={() => handleOpenEditDialog(config)}
                                            sx={{ mr: 1 }}
                                        >
                                            编辑
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            color="error"
                                            onClick={() => handleSwitchModel(config.modelType, config.model)}
                                            disabled={currentModel && currentModel.id === config.id}
                                        >
                                            {currentModel && currentModel.id === config.id? '当前使用' : '切换'}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <Button
                    variant="contained"
                    color="error"
                    onClick={handleDeleteModel}
                    disabled={selectedConfigs.length === 0}
                    sx={{ mt: 2 }}
                >
                    删除选中模型
                </Button>
                <Pagination
                    count={Math.ceil(total / pageSize)}
                    page={curPage}
                    onChange={handlePageChange}
                    sx={{ mt: 2 }}
                />
            </Card>
            <Dialog open={openEditDialog} onClose={handleCloseEditDialog}
                sx={{
                    '&.MuiPaper-root': {
                        borderRadius: 10,
                        boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)'
                    }
                }}>
                <DialogTitle>编辑模型配置</DialogTitle>
                <DialogContent>
                    {editModel && (
                        <>
                            <DialogContentText>
                                <Typography sx={{ mb: 1 }}>模型类型:</Typography>
                                <Select
                                    value={editModel.modelType}
                                    onChange={(e) => setEditModel({...editModel, modelType: e.target.value })}
                                    sx={{ width: '100%', mb: 2 }}
                                >
                                    {modelTypes.map(type => (
                                        <MenuItem key={type} value={type}>{type}</MenuItem>
                                    ))}
                                </Select>
                            </DialogContentText>
                            <DialogContentText>
                                <Typography sx={{ mb: 1 }}>模型:</Typography>
                                <input
                                    type="text"
                                    value={editModel.model}
                                    onChange={(e) => setEditModel({...editModel, model: e.target.value })}
                                    sx={{ width: '100%', mb: 2 }}
                                />
                            </DialogContentText>
                            <DialogContentText>
                                <Typography sx={{ mb: 1 }}>模型名称:</Typography>
                                <input
                                    type="text"
                                    value={editModel.modelName}
                                    onChange={(e) => setEditModel({...editModel, modelName: e.target.value })}
                                    sx={{ width: '100%', mb: 2 }}
                                />
                            </DialogContentText>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => handleUpdateModel(editModel)}
                                sx={{ mt: 2 }}
                            >
                                保存修改
                            </Button>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </Box>
    );
}

export default ModelManagementPage;