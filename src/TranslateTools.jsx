import React, { useState, useEffect } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Select, 
  MenuItem, 
  Typography, 
  IconButton,
  Grid,
  Alert,
  InputAdornment,
  ListSubheader,
  Chip,
  Popper,
  Paper,
  Divider,
  ClickAwayListener,
  Avatar
} from '@mui/material';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import SearchIcon from '@mui/icons-material/Search';
import apiRequest from './api.js';
import LANGUAGES_DATA from './language-data.js';

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
  const [sourceLang, setSourceLang] = useState('zh'); // 默认中文
  const [targetLang, setTargetLang] = useState('en'); // 默认英文
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeInitial, setActiveInitial] = useState('');
  const [anchorElSource, setAnchorElSource] = useState(null);
  const [anchorElTarget, setAnchorElTarget] = useState(null);
  const [processedLanguages, setProcessedLanguages] = useState([]);

  // 处理语言数据
  useEffect(() => {
    const data = Object.entries(LANGUAGES_DATA)
      .filter(([code]) => code !== 'moc' && code !== 'src') // 移除重复项
      .map(([code, lang]) => ({
        code,
        zhName: lang.zhName,
        enName: lang.enName,
        pinyin: lang.pinyin,
        initial: lang.pinyin ? lang.pinyin[0].toUpperCase() : '#'
      }))
      .sort((a, b) => a.pinyin.localeCompare(b.pinyin));
    
    setProcessedLanguages(data);
  }, []);

  // 获取过滤后的语言列表
  const getFilteredLanguages = () => {
    if (!searchTerm.trim()) return processedLanguages;
    
    const lowerSearch = searchTerm.toLowerCase();
    return processedLanguages.filter(lang => 
      lang.zhName.toLowerCase().includes(lowerSearch) ||
      lang.enName.toLowerCase().includes(lowerSearch) ||
      lang.pinyin.toLowerCase().includes(lowerSearch) ||
      lang.code.toLowerCase().includes(lowerSearch)
    );
  };

  // 获取所有拼音首字母
  const getInitials = () => {
    const initials = new Set();
    getFilteredLanguages().forEach(lang => initials.add(lang.initial));
    return Array.from(initials).sort();
  };

  const swapLanguages = () => {
    if (sourceText.trim() === '') return;
    
    const tempLang = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(tempLang);
    
    if (sourceText && targetText) {
      const tempText = sourceText;
      setSourceText(targetText);
      setTargetText(tempText);
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

  // 处理源语言输入变化
  const handleSourceTextChange = (e) => {
    setSourceText(e.target.value);
  };

  // 打开源语言选择器
  const handleClickSource = (event) => {
    setAnchorElSource(event.currentTarget);
    setSearchTerm('');
  };

  // 打开目标语言选择器
  const handleClickTarget = (event) => {
    setAnchorElTarget(event.currentTarget);
    setSearchTerm('');
  };

  // 关闭所有选择器
  const handleClose = () => {
    setAnchorElSource(null);
    setAnchorElTarget(null);
  };

  // 选择语言
  const handleSelectLanguage = (langCode, isSource) => {
    if (isSource) {
      setSourceLang(langCode);
    } else {
      setTargetLang(langCode);
    }
    handleClose();
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
      <Grid container spacing={2} justifyContent="center" mb={6}>
        <Grid item xs={12} md={5}>
          <Box position="relative">
            <Button
              variant="outlined"
              fullWidth
              onClick={handleClickSource}
              endIcon={<i className="fa fa-chevron-down" />}
              sx={{
                borderRadius: 100,
                textAlign: 'left',
                padding: '8px 16px',
                borderColor: COLORS.primary,
                '&:hover': {
                  borderColor: COLORS.primary,
                  backgroundColor: 'rgba(255, 94, 135, 0.05)'
                }
              }}
            >
              <Box display="flex" alignItems="center">
                <Avatar sx={{ 
                  bgcolor: COLORS.primary, 
                  width: 24, 
                  height: 24, 
                  mr: 2 
                }}>
                  {getLanguageName(sourceLang, 'zhName').charAt(0)}
                </Avatar>
                <span>{getLanguageName(sourceLang, 'zhName')}</span>
              </Box>
            </Button>
            
            {/* 源语言选择器下拉菜单 */}
            <Popper
              open={Boolean(anchorElSource)}
              anchorEl={anchorElSource}
              placement="bottom"
              modifiers={[{
                name: 'offset',
                options: {
                  offset: [0, 5],
                },
              }]}
              sx={{
                zIndex: 100,
                width: '100%',
                maxWidth: 360
              }}
            >
              <Paper sx={{ borderRadius: 16, boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)' }}>
                <ClickAwayListener onClickAway={handleClose}>
                  <Box p={2}>
                    {/* 搜索框 */}
                    <TextField
                      label="搜索语言"
                      variant="outlined"
                      size="small"
                      fullWidth
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon />
                          </InputAdornment>
                        )
                      }}
                      sx={{ 
                        mb: 2,
                        borderRadius: 100,
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': {
                            borderColor: COLORS.primary
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: COLORS.primary
                          }
                        }
                      }}
                    />
                    
                    {/* 拼音首字母导航 */}
                    <Box sx={{ 
                      display: 'flex', 
                      flexWrap: 'wrap', 
                      gap: 1, 
                      mb: 2,
                      justifyContent: 'center' 
                    }}>
                      {getInitials().map(initial => (
                        <Chip
                          key={initial}
                          label={initial}
                          size="small"
                          color={activeInitial === initial ? 'primary' : 'default'}
                          onClick={() => {
                            setActiveInitial(initial);
                            const element = document.getElementById(`source-${initial}`);
                            element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }}
                          sx={{
                            cursor: 'pointer',
                            '&:hover': {
                              backgroundColor: activeInitial === initial ? 
                                COLORS.primary : 'rgba(255, 94, 135, 0.1)'
                            }
                          }}
                        />
                      ))}
                    </Box>
                    
                    {/* 语言列表 */}
                    <Box sx={{ maxHeight: 300, overflowY: 'auto', pr: 1 }}>
                      {renderLanguageOptions(getFilteredLanguages(), 'source')}
                    </Box>
                  </Box>
                </ClickAwayListener>
              </Paper>
            </Popper>
          </Box>
        </Grid>
        
        <Grid item xs={12} md={2} textAlign="center" my={2}>
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
        
        <Grid item xs={12} md={5}>
          <Box position="relative">
            <Button
              variant="outlined"
              fullWidth
              onClick={handleClickTarget}
              endIcon={<i className="fa fa-chevron-down" />}
              sx={{
                borderRadius: 100,
                textAlign: 'left',
                padding: '8px 16px',
                borderColor: COLORS.primary,
                '&:hover': {
                  borderColor: COLORS.primary,
                  backgroundColor: 'rgba(255, 94, 135, 0.05)'
                }
              }}
            >
              <Box display="flex" alignItems="center">
                <Avatar sx={{ 
                  bgcolor: COLORS.primary, 
                  width: 24, 
                  height: 24, 
                  mr: 2 
                }}>
                  {getLanguageName(targetLang, 'zhName').charAt(0)}
                </Avatar>
                <span>{getLanguageName(targetLang, 'zhName')}</span>
              </Box>
            </Button>
            
            {/* 目标语言选择器下拉菜单 */}
            <Popper
              open={Boolean(anchorElTarget)}
              anchorEl={anchorElTarget}
              placement="bottom"
              modifiers={[{
                name: 'offset',
                options: {
                  offset: [0, 5],
                },
              }]}
              sx={{
                zIndex: 100,
                width: '100%',
                maxWidth: 360
              }}
            >
              <Paper sx={{ borderRadius: 16, boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)' }}>
                <ClickAwayListener onClickAway={handleClose}>
                  <Box p={2}>
                    {/* 搜索框 */}
                    <TextField
                      label="搜索语言"
                      variant="outlined"
                      size="small"
                      fullWidth
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon />
                          </InputAdornment>
                        )
                      }}
                      sx={{ 
                        mb: 2,
                        borderRadius: 100,
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': {
                            borderColor: COLORS.primary
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: COLORS.primary
                          }
                        }
                      }}
                    />
                    
                    {/* 拼音首字母导航 */}
                    <Box sx={{ 
                      display: 'flex', 
                      flexWrap: 'wrap', 
                      gap: 1, 
                      mb: 2,
                      justifyContent: 'center' 
                    }}>
                      {getInitials().map(initial => (
                        <Chip
                          key={initial}
                          label={initial}
                          size="small"
                          color={activeInitial === initial ? 'primary' : 'default'}
                          onClick={() => {
                            setActiveInitial(initial);
                            const element = document.getElementById(`target-${initial}`);
                            element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }}
                          sx={{
                            cursor: 'pointer',
                            '&:hover': {
                              backgroundColor: activeInitial === initial ? 
                                COLORS.primary : 'rgba(255, 94, 135, 0.1)'
                            }
                          }}
                        />
                      ))}
                    </Box>
                    
                    {/* 语言列表 */}
                    <Box sx={{ maxHeight: 300, overflowY: 'auto', pr: 1 }}>
                      {renderLanguageOptions(getFilteredLanguages(), 'target')}
                    </Box>
                  </Box>
                </ClickAwayListener>
              </Paper>
            </Popper>
          </Box>
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
            }
          }}
        >
          {loading ? '翻译中...' : '开始翻译'}
        </Button>
      </Box>
    </Box>
  );

  // 辅助函数：获取语言名称
  function getLanguageName(code, type) {
    return processedLanguages.find(lang => lang.code === code)?.[type] || '未知语言';
  }

  // 辅助函数：渲染语言选项
  function renderLanguageOptions(langs, type) {
    const grouped = {};
    langs.forEach(lang => {
      const initial = lang.initial;
      if (!grouped[initial]) grouped[initial] = [];
      grouped[initial].push(lang);
    });

    return Object.entries(grouped).map(([initial, group]) => (
      <React.Fragment key={initial}>
        <ListSubheader 
          component="div" 
          id={`${type}-${initial}`}
          sx={{ 
            backgroundColor: COLORS.light, 
            fontWeight: 'bold', 
            textTransform: 'uppercase',
            fontSize: '0.875rem',
            padding: '8px 16px',
            mt: 1
          }}
        >
          {initial}
        </ListSubheader>
        {group.map(lang => (
          <Box 
            key={lang.code}
            onClick={() => handleSelectLanguage(lang.code, type === 'source')}
            sx={{
              p: 2,
              borderRadius: 8,
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: 'rgba(255, 94, 135, 0.1)'
              },
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Avatar sx={{ 
              bgcolor: COLORS.primary, 
              width: 24, 
              height: 24, 
              mr: 2,
              fontSize: '0.75rem'
            }}>
              {lang.zhName.charAt(0)}
            </Avatar>
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
              {lang.zhName}
            </Typography>
          </Box>
        ))}
        <Divider sx={{ my: 1 }} />
      </React.Fragment>
    ));
  }
}

export default TranslateTool;