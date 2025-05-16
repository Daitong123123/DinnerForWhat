import React, { useState, useEffect } from 'react';
import apiRequest from './api.js';
import { useNavigate } from 'react-router-dom';
import {
    Box
} from '@mui/material';

const ImageMessage = ({ fileId, onImageClick }) => {
    const [imageUrl, setImageUrl] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchImage = async () => {
            try {
                const response = await apiRequest(`/aliyun/download?fileId=${fileId}`,'GET', null, navigate);
            
                if (response.code === '200' && response.data) {
                    setImageUrl(response.data);
                } else {
                    throw new Error(response.message || '获取图片失败');
                }
            } catch (err) {
                console.error('加载图片出错:', err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchImage();
    }, [fileId]);

    return (
        <Box 
            sx={{ 
                maxWidth: '80%', 
                borderRadius: 3, 
                overflow: 'hidden', 
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                cursor: 'pointer' 
            }}
            onClick={(e) => onImageClick(e, imageUrl)}
        >
            {loading && <div>加载中...</div>}
            {error && <div>图片加载失败</div>}
            {imageUrl && (
                <img 
                    src={imageUrl} 
                    alt="聊天图片" 
                    style={{ maxWidth: '100%', height: 'auto', borderRadius: 3 }}
                />
            )}
        </Box>
    );
};

export default ImageMessage;    