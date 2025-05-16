import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Select, 
  MenuItem, 
  Typography, 
  IconButton,
  Grid,
  Alert
} from '@mui/material';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import apiRequest from './api.js';

// 恋爱记风格配色
const COLORS = {
    primary: '#FF5E87',
    secondary: '#FFB6C1',
    accent: '#FF85A2',
    light: '#FFF0F3',
    dark: '#333333'
};

function TranslateTool() {
  const [sourceText, setSourceText] = useState('');
  const [targetText, setTargetText] = useState('');
  const [sourceLang, setSourceLang] = useState('zh');
  const [targetLang, setTargetLang] = useState('en');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

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
    setSuccess(null);
    
    try {
      const response = await apiRequest('/translate', 'POST', {
        content: sourceText,
        originalLanguage: sourceLang,
        targetLanguage: targetLang
      });
      
      if (response.code === "200") {
        setTargetText(response.data);
        setSuccess('翻译成功');
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
    <Box sx={{ p: 4, maxWidth: 800, margin: '0 auto', minHeight: '100vh', backgroundColor: COLORS.light }}>
      {error && (
        <Alert severity="error" sx={{ mb: 4, borderRadius: 8 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 4, borderRadius: 8 }}>
          {success}
        </Alert>
      )}
      
      <Typography variant="h4" component="h1" gutterBottom sx={{ 
        textAlign: 'center', 
        fontWeight: 'bold', 
        color: COLORS.dark,
        mt: 4,
        mb: 6
      }}>
        恋爱翻译器
      </Typography>
      
      {/* 语言选择区域 */}
      <Grid container spacing={2} alignItems="center" justifyContent="center" mb={6}>
        <Grid item xs={5} md={4}>
          <Select
            value={sourceLang}
            onChange={(e) => setSourceLang(e.target.value)}
            displayEmpty
            variant="outlined"
            size="small"
            fullWidth
            sx={{ 
              borderRadius: 100,
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: COLORS.primary
                },
                '&.Mui-focused fieldset': {
                  borderColor: COLORS.primary
                }
              },
              '& .MuiSelect-select': {
                padding: '8px 12px'
              }
            }}
          >
            {languages.map(lang => (
              <MenuItem key={lang.code} value={lang.code}>{lang.name}</MenuItem>
            ))}
          </Select>
        </Grid>
        
        <Grid item xs={2} md={1} textAlign="center">
          <IconButton onClick={swapLanguages} color="primary" sx={{
            color: COLORS.primary,
            backgroundColor: 'white',
            borderRadius: '50%',
            padding: '8px',
            boxShadow: '0 2px 8px rgba(255, 94, 135, 0.15)',
            '&:hover': {
              backgroundColor: 'rgba(255, 94, 135, 0.05)',
              boxShadow: '0 4px 12px rgba(255, 94, 135, 0.2)'
            }
          }}>
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
            sx={{ 
              borderRadius: 100,
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: COLORS.primary
                },
                '&.Mui-focused fieldset': {
                  borderColor: COLORS.primary
                }
              },
              '& .MuiSelect-select': {
                padding: '8px 12px'
              }
            }}
          >
            {languages.map(lang => (
              <MenuItem key={lang.code} value={lang.code}>{lang.name}</MenuItem>
            ))}
          </Select>
        </Grid>
      </Grid>
      
      {/* 翻译输入和输出区域 */}
      <Grid container spacing={4} justifyContent="center">
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
              borderRadius: 16,
              border: 'none',
              boxShadow: '0 4px 15px rgba(255, 94, 135, 0.1)',
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: COLORS.primary
                },
                '&.Mui-focused fieldset': {
                  borderColor: COLORS.primary
                }
              },
              '& .MuiInputBase-input': {
                fontSize: '1rem',
                lineHeight: 1.5,
                padding: '14px'
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
              borderRadius: 16,
              border: 'none',
              boxShadow: '0 4px 15px rgba(255, 94, 135, 0.1)',
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: error ? '#f44336' : COLORS.primary
                },
                '&.Mui-focused fieldset': {
                  borderColor: error ? '#f44336' : COLORS.primary
                }
              },
              '& .MuiInputBase-input': {
                fontSize: '1rem',
                lineHeight: 1.5,
                padding: '14px',
                color: error ? '#f44336' : COLORS.dark
              }
            }}
          />
        </Grid>
      </Grid>
      
      {/* 翻译按钮 */}
      <Box mt={8} textAlign="center">
        <Button
          variant="contained"
          color="primary"
          onClick={handleTranslate}
          disabled={loading || !sourceText.trim()}
          sx={{
            px: 10,
            py: 3,
            borderRadius: 100,
            textTransform: 'none',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            backgroundColor: COLORS.primary,
            color: 'white',
            boxShadow: '0 4px 20px rgba(255, 94, 135, 0.25)',
            '&:hover': {
              backgroundColor: '#FF4778',
              boxShadow: '0 6px 25px rgba(255, 94, 135, 0.35)'
            },
            '&:active': {
              transform: 'scale(0.98)'
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