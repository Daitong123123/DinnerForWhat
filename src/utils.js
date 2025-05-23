
import {
    Box,
    Typography,
    Card,
    Avatar,
    CircularProgress
} from '@mui/material';
import sha1 from 'js-sha1';
import { CloudUploadOutlined } from '@mui/icons-material';
import COLORS from './constants/color';
import apiRequest from './api';

export const calculateFileHash = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsArrayBuffer(file);

        reader.onload = (e) => {
            try {
                const buffer = e.target.result;
                const uint8Array = new Uint8Array(buffer);
                const hashHex = sha1(uint8Array);
                resolve(hashHex);
            } catch (err) {
                reject(new Error(`哈希计算失败: ${err.message}`));
            }
        };

        reader.onerror = () => {
            reject(new Error('文件读取失败'));
        };
    });
};
// 渲染星星的函数
export const renderStars = (complex) => {
    return Array.from({ length: 10 }, (_, i) => (
        <span key={i} style={{ color: i < parseInt(complex, 10) ? '#FFD700' : '#ccc' }}>
            {i < parseInt(complex, 10) ? '★' : '☆'}
        </span>
    ));
};

// 渲染菜谱卡片的函数
export const renderCookbookCard = (cookbook) => {
    return (
        <Card
            sx={{
                p: 3,
                background: '#f5e9d7', // 米色背景，模拟纸张颜色
                borderRadius: 8,
                border: '1px solid #d6c6b4',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                transition: 'box-shadow 0.3s',
                '&:hover': {
                    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)'
                },
                '@media (max-width: 600px)': {
                    width: '100%',
                    p: 2
                },
                maxWidth: '80%',
                fontFamily: 'Georgia, serif', // 更具亲和力的字体
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            <Typography variant="h5" sx={{ mb: 1, fontWeight: 'bold' }}>
                {cookbook.dishName}
            </Typography>
            <Typography variant="caption" sx={{ mb: 1, color: '#666' }}>
                复杂度: {renderStars(parseInt(cookbook.complex, 10))}
            </Typography>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mb: 2 }}>
                {cookbook.dishStep}
            </Typography>
            <hr style={{ border: '0.5px solid #d6c6b4', margin: '16px 0' }} />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                <div>
                    <Typography variant="body2" sx={{ color: 'green', fontWeight: 'bold' }}>
                        功效:
                    </Typography>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                        {cookbook.dishEffect}
                    </Typography>
                </div>
                <div>
                    <Typography variant="body2" sx={{ color: 'brown', fontWeight: 'bold' }}>
                        食材:
                    </Typography>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                        {cookbook.dishIngredients}
                    </Typography>
                </div>
                <div>
                    <Typography variant="body2" sx={{ color: 'orange', fontWeight: 'bold' }}>
                        花费:
                    </Typography>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                        {cookbook.dishCost}
                    </Typography>
                </div>
                <div>
                    <Typography variant="body2" sx={{ color: 'blue', fontWeight: 'bold' }}>
                        菜系:
                    </Typography>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                        {cookbook.dishFrom}
                    </Typography>
                </div>
                <div>
                    <Typography variant="body2" sx={{ color: 'purple', fontWeight: 'bold' }}>
                        口味:
                    </Typography>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                        {cookbook.tasty}
                    </Typography>
                </div>
            </div>
            {/* 模拟书页的阴影效果 */}
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0))',
                    pointerEvents: 'none'
                }}
            />
        </Card>
    );
};   

export const  getUrlByIconId = async(iconId)=>{
    try {
        // 使用apiRequest替代fetch
        const response = await apiRequest(`/aliyun/download`, 'GET', {fileId: iconId });
        
        if (response && response.code === '200' && response.data) {
            return response.data;
        } else {
            console.error('获取头像失败:', response?.message || '未知错误');
            return undefined;
        }
    } catch (error) {
        console.error('获取头像请求出错:', error);
    } 
}


export const UserAvatar = ({ iconId, name, avatarUrl, size = 120, loading = false, editable = false, onEdit, previewUrl, hasPreview }) => {
    const firstChar = name ? name.charAt(0).toUpperCase() : 'U';
    
    return (
        <Box position="relative" display="inline-flex" >
            {loading ? (
                <Box 
                    sx={{ 
                        width: size, 
                        height: size, 
                        borderRadius: '50%',
                        backgroundColor: '#f0f0f0',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        boxShadow: '0 4px 15px rgba(255, 94, 135, 0.3)'
                    }}
                >
                    <CircularProgress size={size / 3} color="primary" />
                </Box>
            ) : (
                <Avatar 
                    sx={{ 
                        width: size, 
                        height: size, 
                        fontSize: size / 3,
                        boxShadow: '0 4px 15px rgba(255, 94, 135, 0.3)',
                        border: '2px solid white',
                        transition: 'all 0.3s ease'
                    }}
                    src={hasPreview ? previewUrl : avatarUrl}
                >
                    {!avatarUrl && !previewUrl && firstChar}
                </Avatar>
            )}
            
            {editable && (
                <Box 
                    position="absolute" 
                    bottom={0} 
                    right={0} 
                    sx={{
                        backgroundColor: COLORS.primary,
                        color: 'white',
                        borderRadius: '50%',
                        padding: '4px',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                            transform: 'scale(1.1)',
                            backgroundColor: '#FF4778'
                        }
                    }}
                    onClick={onEdit}
                >
                    <CloudUploadOutlined fontSize="small" />
                </Box>
            )}
        </Box>
    );
};