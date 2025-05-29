import React from "react";
import {
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  CardMedia,
  AppBar,
  Toolbar,
  IconButton,
  TextField,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import BottomNavigationBar from "../BottomNavigationBar.jsx";
import Layout from "../Layout.jsx";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { styled } from "@mui/system";
import COLORS from "../constants/color.js";
import { FaSearch } from "react-icons/fa";

// 自定义卡片样式 - 恋爱记风格
const StyledCard = styled(Card)(({ theme }) => ({
  width: "100%",
  borderRadius: "1.25rem",
  border: "none",
  boxShadow: "0 4px 20px rgba(255, 94, 135, 0.1)",
  transition: "all 0.3s ease",
  backgroundColor: "white",
  overflow: "hidden",
  "&:hover": {
    transform: "translateY(-8px)",
    boxShadow: "0 12px 30px rgba(255, 94, 135, 0.2)",
  },
  "&:active": {
    transform: "translateY(-4px)",
  },
}));

// 自定义卡片媒体区域
const StyledCardMedia = styled(CardMedia)(({ theme }) => ({
  height: "120px",
  borderTopLeftRadius: "1.25rem",
  borderTopRightRadius: "1.25rem",
  position: "relative",
  overflow: "hidden",
  "&:after": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background:
      "linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.2) 100%)",
    pointerEvents: "none",
  },
}));

// 自定义卡片标题
const StyledCardTitle = styled(Typography)(({ theme }) => ({
  color: COLORS.dark,
  fontWeight: "500",
  fontSize: "0.95rem",
  letterSpacing: "0.02em",
  marginTop: "0.5rem",
  background:
    "linear-gradient(135deg, rgba(255,94,135,0.05) 0%, rgba(255,94,135,0) 100%)",
  padding: "0.5rem",
  borderRadius: "0.75rem",
}));

// 自定义搜索框
const StyledSearchBox = styled(TextField)(({ theme }) => ({
  width: "100%",
  "& .MuiOutlinedInput-root": {
    borderRadius: "1.25rem",
    padding: "0.5rem 1rem",
    backgroundColor: "white",
    boxShadow: "0 2px 8px rgba(255, 94, 135, 0.05)",
    "&:hover fieldset": {
      borderColor: "rgba(255, 94, 135, 0.3)",
    },
    "&.Mui-focused fieldset": {
      borderColor: COLORS.primary,
      boxShadow: "0 2px 12px rgba(255, 94, 135, 0.15)",
    },
  },
  "& .MuiInputBase-input": {
    paddingLeft: "2.5rem",
    fontSize: "0.9rem",
    color: COLORS.dark,
  },
}));

function ToolPage() {
  const navigate = useNavigate();

  // 工具列表数据 - 添加恋爱记风格的图标和颜色
  const tools = [
    {
      id: 1,
      name: "翻译",
      iconUrl: "https://picsum.photos/seed/translate/200/200",
      onClick: () => navigate("/tool/translate"),
      color: COLORS.primary, // 使用恋爱记主色调
    },
    {
      id: 2,
      name: "小星星",
      iconUrl: "https://picsum.photos/seed/star/200/200",
      onClick: () => navigate("/tool/star-game"),
      color: COLORS.secondary, // 使用恋爱记辅助色
    },
    {
      id: 3,
      name: "记账本",
      iconUrl: "https://picsum.photos/seed/account/200/200",
      onClick: () => navigate("/tool/account"),
      color: "#FF5E87", // 恋爱记粉色系
    },
    {
      id: 4,
      name: "情侣挑战",
      iconUrl: "https://picsum.photos/seed/challenge/200/200",
      onClick: () => navigate("/tool/challenge"),
      color: "#FFA07A", // 恋爱记橙色系
    },
    {
      id: 5,
      name: "八字合婚",
      iconUrl: "https://picsum.photos/seed/fate/200/200",
      onClick: () => navigate("/tool/fate"),
      color: "#FFC0CB", // 恋爱记浅粉色
    },
    {
      id: 6,
      name: "塔罗牌",
      iconUrl: "https://picsum.photos/seed/tarot/200/200",
      onClick: () => navigate("/tool/tarot"),
      color: "#FF69B4", // 恋爱记粉色
    },
    {
      id: 7,
      name: "星座解析",
      iconUrl: "https://picsum.photos/seed/horoscope/200/200",
      onClick: () => navigate("/tool/horoscope"),
      color: "#FF7F50", // 恋爱记珊瑚色
    },
    {
      id: 8,
      name: "爱情笔记",
      iconUrl: "https://picsum.photos/seed/love-note/200/200",
      onClick: () => navigate("/tool/love-note"),
      color: "#FF4500", // 恋爱记红色系
    },
    {
      id: 9,
      name: "共享日程",
      iconUrl: "https://picsum.photos/seed/schedule/200/200",
      onClick: () => navigate("/tool/schedule"),
      color: "#FF6347", // 恋爱记橙红色
    },
    {
      id: 10,
      name: "恋爱进度",
      iconUrl: "https://picsum.photos/seed/progress/200/200",
      onClick: () => navigate("/tool/progress"),
      color: "#FFA500", // 恋爱记暖橙色
    },
  ];

  return (
    <Layout>
      {/* 顶部导航栏 - 恋爱记风格 */}
      <AppBar
        position="sticky"
        color="inherit"
        elevation={0}
        sx={{
          backgroundColor: "white",
          borderBottom: "1px solid rgba(255, 94, 135, 0.1)",
          boxShadow: "0 2px 10px rgba(255, 94, 135, 0.05)",
        }}
      >
        <Toolbar sx={{ padding: "0.5rem 1rem" }}>
          <IconButton
            edge="start"
            color="primary"
            aria-label="back"
            onClick={() => navigate(-1)}
            sx={{
              borderRadius: "50%",
              transition: "all 0.3s ease",
              "&:hover": {
                backgroundColor: "rgba(255, 94, 135, 0.1)",
              },
            }}
          >
            <ArrowBackIosNewIcon
              fontSize="small"
              style={{ color: COLORS.primary }}
            />
          </IconButton>
          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: 1,
              textAlign: "center",
              color: COLORS.dark,
              fontWeight: "bold",
              background: `linear-gradient(45deg, ${COLORS.primary}, ${COLORS.secondary})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              textFillColor: "transparent",
              fontSize: { xs: "1.25rem", sm: "1.5rem" },
            }}
          >
            恋爱工具箱
          </Typography>
          <Box sx={{ width: 24 }} /> {/* 保持布局对称 */}
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          p: 3,
          minHeight: "calc(100vh - 112px)",
          backgroundColor: COLORS.light,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ff9eb7' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          backgroundSize: "100px",
          backgroundPosition: "center",
        }}
      >
        {/* 搜索框区域 - 恋爱记风格 */}
        <Box sx={{ mb: 6, position: "relative" }}>
          <StyledSearchBox
            placeholder="搜索工具..."
            variant="outlined"
            InputProps={{
              startAdornment: (
                <Box
                  sx={{
                    position: "absolute",
                    left: "1rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: COLORS.primary,
                  }}
                >
                  <FaSearch />
                </Box>
              ),
              disableUnderline: true,
            }}
          />
        </Box>

        {/* 装饰性标题 */}
        <Box sx={{ mb: 5, textAlign: "center" }}>
          <Typography
            variant="h5"
            sx={{
              color: COLORS.dark,
              fontWeight: "bold",
              display: "inline-block",
              position: "relative",
              "&:before": {
                content: '""',
                position: "absolute",
                width: "40%",
                height: "2px",
                bottom: "-8px",
                left: "30%",
                backgroundColor: COLORS.primary,
                borderRadius: "1px",
                opacity: "0.6",
              },
            }}
          >
            为恋爱增添趣味
          </Typography>
        </Box>

        {/* 工具网格布局 - 优化间距和排列 */}
        <Grid container spacing={3} justifyContent="center">
          {tools.map(
            (tool, index) =>
              index !== 1 && (
                <Grid
                  item
                  key={tool.id}
                  xs={6}
                  sm={4}
                  md={3}
                  lg={3}
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    transition: "all 0.3s ease",
                  }}
                >
                  <StyledCard
                    onClick={tool.onClick}
                    sx={{
                      borderTop: `3px solid ${tool.color}`,
                      transform: "translateY(0)",
                      transition: "all 0.3s ease",
                    }}
                  >
                    <StyledCardMedia
                      component="img"
                      image={tool.iconUrl}
                      alt={tool.name}
                      sx={{
                        filter: `hue-rotate(${
                          Math.random() * 40 - 20
                        }deg) brightness(1.05)`,
                        transition: "all 0.5s ease",
                      }}
                    />
                    <CardContent sx={{ padding: "1rem", textAlign: "center" }}>
                      <StyledCardTitle>{tool.name}</StyledCardTitle>
                    </CardContent>
                    {/* 卡片底部装饰 */}
                    <Box
                      sx={{
                        height: "6px",
                        backgroundColor: tool.color,
                        opacity: "0.3",
                        width: "100%",
                        position: "absolute",
                        bottom: 0,
                      }}
                    />
                  </StyledCard>
                </Grid>
              )
          )}
        </Grid>
      </Box>
      <BottomNavigationBar />
    </Layout>
  );
}

export default ToolPage;
