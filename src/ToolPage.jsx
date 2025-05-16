import React from 'react';
import { Grid, Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import BottomNavigationBar from './BottomNavigationBar';
import Layout from './Layout';

function ToolPage() {
  const navigate = useNavigate();

  // 工具列表数据
  const tools = [
    {
      id: 1,
      name: '翻译',
      iconUrl: 'https://picsum.photos/seed/translate/120/120',
      onClick: () => navigate('/tool/translate')
    },
    {
      id: 2,
      name: '小星星',
      iconUrl: 'https://picsum.photos/seed/star/120/120',
      onClick: () => navigate('/tool/star-game')
    },
    // 可扩展更多工具...
  ];

  return (
    <Layout>
<Box sx={{ p: 4, minHeight: 'calc(100vh - 56px)' }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center', fontWeight: '500' }}>
        工具箱
      </Typography>
      {/* 工具网格布局 - 透明背景，类似手机App风格 */}
      <Grid container spacing={4} justifyContent="flex-start">
        {tools.map(tool => (
          <Grid item
            key={tool.id}
            xs={6}
            sm={4}
            md={3}
            lg={2}
            xl={2}
            sx={{ display: 'flex', justifyContent: 'center' }}
          >
            <Box
              onClick={tool.onClick}
              sx={{
                width: '100%',
                maxWidth: 120,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'scale(1.05)' }
              }}
            >
              {/* 工具图标 - 圆形 */}
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  mb: 2,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  transition: 'boxShadow 0.2s',
                  '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }
                }}
              >
                <img
                  src={tool.iconUrl}
                  alt={tool.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </Box>

              {/* 工具名称 */}
              <Typography variant="body2" component="p" sx={{ textAlign: 'center' }}>
                {tool.name}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
    </Layout>
    
  );
}

export default ToolPage;