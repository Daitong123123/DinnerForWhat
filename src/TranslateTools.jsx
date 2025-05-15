import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Select, 
  MenuItem, 
  Typography, 
  IconButton,
  Grid
} from '@mui/material';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import apiRequest from './api.js';

function TranslateTool() {
  const [sourceText, setSourceText] = useState('');
  const [targetText, setTargetText] = useState('');
  const [sourceLang, setSourceLang] = useState('zh');
  const [targetLang, setTargetLang] = useState('en');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const languages = [
    { code: 'zh', name: '中文' },
    { code: 'en', name: '英语' },
    { code: 'ja', name: '日语' },
    { code: 'ko', name: '韩语' },
    { code: 'fr', name: '法语' },
    { code: 'de', name: '德语' },
    { code: 'es', name: '西班牙语' },
  ];

  const swapLanguages = () => {
    if (sourceText.trim() === '') return;
    
    const tempLang = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(tempLang);
    
    if (sourceText && targetText) {
      const tempText = sourceText;
      setSourceText(targetText);
      setTargetText(sourceText);
    }
  };

  const handleTranslate = async () => {
    if (!sourceText.trim()) {
      setError('请输入要翻译的内容');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiRequest('/translate', 'POST', {
        content: sourceText,
        originalLanguage: sourceLang,
        targetLanguage: targetLang
      });
      
      if (response.code === "200") {
        setTargetText(response.data);
      } else {
        setError(response.message || '翻译失败');
      }
    } catch (err) {
      console.error('翻译请求出错:', err);
      setError('网络错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleSourceTextChange = (e) => {
    setSourceText(e.target.value);
  };

  return (
    <Box sx={{ p: 4, maxWidth: 800, margin: '0 auto' }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center', fontWeight: '500' }}>
        翻译工具
      </Typography>
      
      {/* 语言选择区域 - 居中对齐 */}
      <Grid container spacing={2} alignItems="center" justifyContent="center" mb={4}>
        <Grid item xs={5} md={4}>
          <Select
            value={sourceLang}
            onChange={(e) => setSourceLang(e.target.value)}
            displayEmpty
            variant="outlined"
            size="small"
            fullWidth
            sx={{ borderRadius: 1 }}
          >
            {languages.map(lang => (
              <MenuItem key={lang.code} value={lang.code}>{lang.name}</MenuItem>
            ))}
          </Select>
        </Grid>
        
        <Grid item xs={2} md={1} textAlign="center">
          <IconButton onClick={swapLanguages} color="primary">
            <SwapHorizIcon />
          </IconButton>
        </Grid>
        
        <Grid item xs={5} md={4}>
          <Select
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value)}
            displayEmpty
            variant="outlined"
            size="small"
            fullWidth
            sx={{ borderRadius: 1 }}
          >
            {languages.map(lang => (
              <MenuItem key={lang.code} value={lang.code}>{lang.name}</MenuItem>
            ))}
          </Select>
        </Grid>
      </Grid>
      
      {/* 翻译输入和输出区域 - 居中对齐 */}
      <Grid container spacing={3} justifyContent="center">
        <Grid item xs={12} md={10}>
          <TextField
            label="输入要翻译的文本"
            multiline
            rows={6}
            variant="outlined"
            fullWidth
            value={sourceText}
            onChange={handleSourceTextChange}
            placeholder="请输入..."
            sx={{ 
              borderRadius: 1,
              '& .MuiInputBase-input': {
                fontSize: '1rem',
                lineHeight: 1.5
              }
            }}
          />
        </Grid>
        
        <Grid item xs={12} md={10}>
          <TextField
            label="翻译结果"
            multiline
            rows={6}
            variant="outlined"
            fullWidth
            value={targetText || (loading ? '翻译中...' : '')}
            disabled={true}
            placeholder={loading ? '翻译中...' : '翻译结果将显示在这里'}
            error={!!error}
            helperText={error}
            sx={{ 
              borderRadius: 1,
              '& .MuiInputBase-input': {
                fontSize: '1rem',
                lineHeight: 1.5,
                color: error ? '#f44336' : '#333', // 深色文本
              }
            }}
          />
        </Grid>
      </Grid>
      
      {/* 翻译按钮 */}
      <Box mt={6} textAlign="center">
        <Button
          variant="contained"
          color="primary"
          onClick={handleTranslate}
          disabled={loading || !sourceText.trim()}
          sx={{
            px: 8,
            py: 2,
            borderRadius: 100,
            textTransform: 'none',
            fontSize: '1rem',
            fontWeight: '500',
            boxShadow: '0 4px 12px rgba(0, 123, 255, 0.2)',
            '&:hover': {
              boxShadow: '0 6px 16px rgba(0, 123, 255, 0.3)'
            }
          }}
        >
          {loading ? '翻译中...' : '开始翻译'}
        </Button>
      </Box>
    </Box>
  );
}

export default TranslateTool;