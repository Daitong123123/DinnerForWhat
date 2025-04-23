import React, { useState } from'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Button,
    TextField,
    Select,
    MenuItem,
    InputLabel,
    FormControl,
    LinearProgress
} from '@mui/material';

function UploadPage() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [progress, setProgress] = useState(0);
    const [chunkSizeInput, setChunkSizeInput] = useState('34');
    const [fileType, setFileType] = useState('backend');
    const [uploadType, setUploadType] = useState('chunk');
    const [isCancelled, setIsCancelled] = useState(false);
    const [folderPath, setFolderPath] = useState('');

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (file.type === 'application/x-directory') {
                // 处理文件夹选择，这里简单示例为记录文件夹对象
                setSelectedFile([file]);
            } else {
                setSelectedFile([file]);
            }
        } else {
            setSelectedFile(null);
        }
    };

    const readDirectoryFiles = async (directory) => {
        const reader = new FileReader();
        const files = [];

        const readEntries = async (dirEntry) => {
            const entries = await dirEntry.entries();
            for await (const [, entry] of entries) {
                if (entry.isDirectory) {
                    await readEntries(entry);
                } else {
                    const file = await entry.file();
                    files.push(file);
                }
            }
        };

        await readEntries(directory);

        return files;
    };

    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const handleUpload = async () => {
        if (selectedFile) {
            setUploading(true);
            setUploadSuccess(false);
            setUploadError('');
            setIsCancelled(false);

            let filesToUpload = [];
            for (const file of selectedFile) {
                if (file.type === 'application/x-directory') {
                    const dirFiles = await readDirectoryFiles(file);
                    filesToUpload = filesToUpload.concat(dirFiles);
                } else {
                    filesToUpload.push(file);
                }
            }

            const totalFiles = filesToUpload.length;
            let currentFileIndex = 0;

            for (const file of filesToUpload) {
                if (isCancelled) {
                    setUploadError('用户取消上传');
                    setUploading(false);
                    return;
                }

                if (uploadType === 'chunk') {
                    const chunkSize = parseInt(chunkSizeInput, 10) * 1024;
                    const totalChunks = Math.ceil(file.size / chunkSize);

                    for (let i = 0; i < totalChunks; i++) {
                        if (isCancelled) {
                            setUploadError('用户取消上传');
                            setUploading(false);
                            return;
                        }
                        setProgress(Math.round(((currentFileIndex * totalChunks + i) / (totalFiles * totalChunks)) * 100));
                        let retryCount = 0;
                        let uploadSuccessForChunk = false;
                        while (retryCount < 60 &&!uploadSuccessForChunk) {
                            if (isCancelled) {
                                setUploadError('用户取消上传');
                                setUploading(false);
                                return;
                            }
                            const start = i * chunkSize;
                            const end = Math.min(start + chunkSize, file.size);
                            const chunkData = file.slice(start, end);

                            const formData = new FormData();
                            formData.append('chunk', chunkData);
                            formData.append('filename', file.name);
                            formData.append('chunkIndex', i);
                            formData.append('totalChunks', totalChunks);
                            formData.append('fileType', fileType);
                            formData.append('uploadType', uploadType);
                            formData.append('folderPath', folderPath);

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
                    formData.append('file', file);
                    formData.append('filename', file.name);
                    formData.append('fileType', fileType);
                    formData.append('uploadType', uploadType);
                    formData.append('folderPath', folderPath);

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

                currentFileIndex++;
            }

            setUploadSuccess(true);
            setUploading(false);
        }
    };

    const handleCancelUpload = () => {
        setIsCancelled(true);
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f4f4f4',
                color: '#333',
                pb: 6
            }}
        >
            <Card
                sx={{
                    p: 3,
                    width: '100%',
                    maxWidth: 800,
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                    backgroundColor: '#fff',
                    borderRadius: 10,
                    overflow: 'hidden',
                    '@media (max - width: 600px)': {
                        p: 2
                    }
                }}
            >
                <Typography
                    variant="h4"
                    gutterBottom
                    sx={{
                        background: 'linear-gradient(45deg, #64B5F6, #42A5F5)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        textFillColor: 'transparent',
                        textAlign: 'center',
                        mb: 3
                    }}
                >
                    文件上传
                </Typography>
                <FormControl fullWidth sx={{ mb: 3 }}>
                    <Button
                        variant="contained"
                        component="label"
                        fullWidth
                        sx={{
                            mb: 1,
                            background: 'linear-gradient(45deg, #64B5F6, #42A5F5)',
                            '&:hover': {
                                background: 'linear-gradient(45deg, #42A5F5, #64B5F6)'
                            }
                        }}
                    >
                        选择文件
                        <input type="file" hidden onChange={handleFileChange} webkitdirectory />
                    </Button>
                    <Typography variant="caption" sx={{ color: '#777' }}>
                        {selectedFile? selectedFile.length > 1? `${selectedFile.length} 个文件` : selectedFile[0].name : '未选择文件'}
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
                        sx: { color: '#333' }
                    }}
                    InputLabelProps={{
                        sx: { color: '#777' }
                    }}
                />
                <FormControl fullWidth sx={{ mb: 3 }}>
                    <InputLabel sx={{ color: '#777' }}>项目类型</InputLabel>
                    <Select
                        value={fileType}
                        onChange={(e) => setFileType(e.target.value)}
                        label="项目类型"
                        sx={{ color: '#333' }}
                    >
                        <MenuItem value="frontend">前端项目</MenuItem>
                        <MenuItem value="backend">后端项目</MenuItem>
                    </Select>
                </FormControl>
                <FormControl fullWidth sx={{ mb: 3 }}>
                    <InputLabel sx={{ color: '#777' }}>上传类型</InputLabel>
                    <Select
                        value={uploadType}
                        onChange={(e) => setUploadType(e.target.value)}
                        label="上传类型"
                        sx={{ color: '#333' }}
                    >
                        <MenuItem value="chunk">分片上传</MenuItem>
                        <MenuItem value="direct">直接上传</MenuItem>
                    </Select>
                </FormControl>
                <TextField
                    label="文件夹路径（可选）"
                    type="text"
                    value={folderPath}
                    onChange={(e) => setFolderPath(e.target.value)}
                    fullWidth
                    sx={{ mb: 3 }}
                    InputProps={{
                        sx: { color: '#333' }
                    }}
                    InputLabelProps={{
                        sx: { color: '#777' }
                    }}
                />
                <Button
                    variant="contained"
                    onClick={handleUpload}
                    disabled={uploading ||!selectedFile}
                    fullWidth
                    sx={{
                        background: 'linear-gradient(45deg, #64B5F6, #42A5F5)',
                        '&:hover': {
                            background: 'linear-gradient(45deg, #42A5F5, #64B5F6)'
                        },
                        '&:disabled': {
                            background: '#ccc'
                        }
                    }}
                >
                    {uploading? '上传中...' : '上传文件/文件夹'}
                </Button>
                {uploading && (
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleCancelUpload}
                        fullWidth
                        sx={{
                            mt: 2,
                            background: 'linear-gradient(45deg, #ef5350, #e53935)',
                            '&:hover': {
                                background: 'linear-gradient(45deg, #e53935, #ef5350)'
                            },
                            '&:disabled': {
                                background: '#ccc'
                            }
                        }}
                    >
                        取消上传
                    </Button>
                )}
                {uploadSuccess && (
                    <Typography color="success.main" align="center" sx={{ mt: 2 }}>
                        文件/文件夹上传成功
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
                                background: '#e0e0e0',
                                '& .MuiLinearProgress - bar': {
                                    background: 'linear-gradient(45deg, #64B5F6, #42A5F5)'
                                }
                            }}
                        />
                        <Typography variant="caption" align="center" sx={{ mt: 1, color: '#777' }}>
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