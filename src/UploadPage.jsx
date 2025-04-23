import React, { useState } from 'react';
import { Box, Typography, Card, CardContent, Button, TextField, Select, MenuItem, InputLabel, FormControl, LinearProgress } from '@mui/material';

function UploadPage() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [progress, setProgress] = useState(0); // 上传进度
    const [chunkSizeInput, setChunkSizeInput] = useState('34'); // 默认值为 12KB
    const [fileType, setFileType] = useState('backend'); // 默认选后端项目
    const [uploadType, setUploadType] = useState('chunk'); // 默认选择分片上传
    const [isCancelled, setIsCancelled] = useState(false); // 新增：用于跟踪上传是否被取消

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const handleUpload = async () => {
        if (selectedFile) {
            setUploading(true);
            setUploadSuccess(false);
            setUploadError('');
            setIsCancelled(false); // 开始上传时重置取消状态

            if (uploadType === 'chunk') {
                const chunkSize = parseInt(chunkSizeInput, 10) * 1024; // 将输入转换为字节
                const totalChunks = Math.ceil(selectedFile.size / chunkSize);

                for (let i = 0; i < totalChunks; i++) {
                    if (isCancelled) {
                        setUploadError('用户取消上传');
                        setUploading(false);
                        return;
                    }
                    setProgress(Math.round((i / totalChunks) * 100));
                    let retryCount = 0;
                    let uploadSuccessForChunk = false;
                    while (retryCount < 60 && !uploadSuccessForChunk) {
                        if (isCancelled) {
                            setUploadError('用户取消上传');
                            setUploading(false);
                            return;
                        }
                        const start = i * chunkSize;
                        const end = Math.min(start + chunkSize, selectedFile.size);
                        const chunk = selectedFile.slice(start, end);

                        const formData = new FormData();
                        formData.append('chunk', chunk);
                        formData.append('filename', selectedFile.name);
                        formData.append('chunkIndex', i);
                        formData.append('totalChunks', totalChunks);
                        formData.append('fileType', fileType);
                        formData.append('uploadType', uploadType);

                        try {
                            const response = await fetch('http://dinner.daitong.xyz:5000/upload-chunk', {
                                method: 'POST',
                                body: formData
                            });

                            if (response.ok) {
                                uploadSuccessForChunk = true;
                            } else {
                                throw new Error(`上传第 ${i + 1} 片失败`);
                            }
                        } catch (error) {
                            console.error(error);
                            if (retryCount < 240) {
                                await sleep(5000);
                            }
                            retryCount++;
                        }
                    }

                    if (!uploadSuccessForChunk) {
                        setUploadError(`第 ${i + 1} 片上传失败，达到最大重试次数`);
                        setUploading(false);
                        return;
                    }
                }
            } else {
                const formData = new FormData();
                formData.append('file', selectedFile);
                formData.append('filename', selectedFile.name);
                formData.append('fileType', fileType);
                formData.append('uploadType', uploadType);

                try {
                    const response = await fetch('http://47.108.130.95:5000/upload-chunk', {
                        method: 'POST',
                        body: formData
                    });

                    if (!response.ok) {
                        throw new Error('直接上传失败');
                    }
                } catch (error) {
                    console.error(error);
                    setUploadError('直接上传失败');
                    setUploading(false);
                    return;
                }
            }

            setUploadSuccess(true);
            setUploading(false);
        }
    };

    const handleCancelUpload = () => {
        setIsCancelled(true);
    };

    return (
        <Box sx={{
            minHeight: '100vh',
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
            color: 'white'
        }}>
            <Card sx={{
                p: 4,
                width: '100%',
                maxWidth: 500,
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                background: 'linear-gradient(145deg, #2a2a4a 0%, #1e2e5a 100%)',
                border: '1px solid rgba(255,255,255,0.1)'
            }}>
                <Typography variant="h4" gutterBottom sx={{
                    background: 'linear-gradient(45deg, #ff8a00, #e52e71)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    textFillColor: 'transparent',
                    textAlign: 'center',
                    mb: 4
                }}>
                   文件上传
                </Typography>
                <FormControl fullWidth sx={{ mb: 3 }}>
                    <Button
                        variant="contained"
                        component="label"
                        fullWidth
                        sx={{ mb: 1 }}
                    >
                        选择文件
                        <input
                            type="file"
                            hidden
                            onChange={handleFileChange}
                        />
                    </Button>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                        {selectedFile ? selectedFile.name : '未选择文件'}
                    </Typography>
                </FormControl>
                <TextField
                    label="分片大小 (KB)"
                    type="number"
                    value={chunkSizeInput}
                    onChange={(e) => setChunkSizeInput(e.target.value)}
                    fullWidth
                    sx={{ mb: 3 }}
                    InputProps={{
                        sx: { color: 'white' }
                    }}
                    InputLabelProps={{
                        sx: { color: 'rgba(255,255,255,0.7)' }
                    }}
                />
                <FormControl fullWidth sx={{ mb: 3 }}>
                    <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>项目类型</InputLabel>
                    <Select
                        value={fileType}
                        onChange={(e) => setFileType(e.target.value)}
                        label="项目类型"
                        sx={{ color: 'white' }}
                    >
                        <MenuItem value="frontend">前端项目</MenuItem>
                        <MenuItem value="backend">后端项目</MenuItem>
                    </Select>
                </FormControl>
                <FormControl fullWidth sx={{ mb: 3 }}>
                    <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>上传类型</InputLabel>
                    <Select
                        value={uploadType}
                        onChange={(e) => setUploadType(e.target.value)}
                        label="上传类型"
                        sx={{ color: 'white' }}
                    >
                        <MenuItem value="chunk">分片上传</MenuItem>
                        <MenuItem value="direct">直接上传</MenuItem>
                    </Select>
                </FormControl>
                <Button
                    variant="contained"
                    onClick={handleUpload}
                    disabled={uploading || !selectedFile}
                    fullWidth
                    sx={{
                        background: 'linear-gradient(45deg, #ff8a00, #e52e71)',
                        '&:hover': {
                            background: 'linear-gradient(45deg, #e52e71, #ff8a00)'
                        },
                        '&:disabled': {
                            background: 'rgba(255,255,255,0.2)'
                        }
                    }}
                >
                    {uploading ? '上传中...' : '上传 JAR 包'}
                </Button>
                {uploading && (
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleCancelUpload}
                        fullWidth
                        sx={{
                            mt: 2,
                            background: 'linear-gradient(45deg, #e52e71, #ff8a00)',
                            '&:hover': {
                                background: 'linear-gradient(45deg, #ff8a00, #e52e71)'
                            },
                            '&:disabled': {
                                background: 'rgba(255,255,255,0.2)'
                            }
                        }}
                    >
                        取消上传
                    </Button>
                )}
                {uploadSuccess && (
                    <Typography color="success.main" align="center" sx={{ mt: 2 }}>
                        文件上传成功
                    </Typography>
                )}
                {uploadType === 'chunk' && uploading && (
                    <Box sx={{ width: '100%', mt: 2 }}>
                        <LinearProgress 
                            variant="determinate" 
                            value={progress} 
                            sx={{
                                height: 10,
                                borderRadius: 5,
                                background: 'rgba(255,255,255,0.2)',
                                '& .MuiLinearProgress-bar': {
                                    background: 'linear-gradient(45deg, #ff8a00, #e52e71)'
                                }
                            }}
                        />
                        <Typography variant="caption" align="center" sx={{ mt: 1, color: 'rgba(255,255,255,0.7)' }}>
                            {progress}%
                        </Typography>
                    </Box>
                )}
                {uploadError && (
                    <Typography color="error" align="center" sx={{ mt: 2 }}>
                        {uploadError}
                    </Typography>
                )}
            </Card>
        </Box>
    );
}

export default UploadPage;