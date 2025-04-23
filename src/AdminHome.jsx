import React from'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Button
} from '@mui/material';
import { useNavigate } from'react-router-dom';

function AdminHome() {
    const navigate = useNavigate();

    const handleNavigateToModelManagement = () => {
        navigate('/admin/model');
    };

    const handleNavigateToUpload = () => {
        navigate('/admin/upload');
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
            color: '#333'
        }}>
            <Card sx={{
                p: 3,
                width: '100%',
                maxWidth: 500,
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                backgroundColor: '#fff',
                borderRadius: 10,
                // 手机端样式调整
                '@media (max-width: 600px)': {
                    p: 2,
                    maxWidth: '90%'
                }
            }}>
                <CardContent>
                    <Typography variant="h4" gutterBottom sx={{
                        background: 'linear-gradient(45deg, #64B5F6, #42A5F5)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        textFillColor: 'transparent',
                        textAlign: 'center',
                        mb: 4
                    }}>
                        管理员首页
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        sx={{ mb: 3 }}
                        onClick={handleNavigateToModelManagement}
                    >
                        大模型管理
                    </Button>
                    <Button
                        variant="contained"
                        color="secondary"
                        fullWidth
                        onClick={handleNavigateToUpload}
                    >
                        文件上传
                    </Button>
                </CardContent>
            </Card>
        </Box>
    );
}

export default AdminHome;    