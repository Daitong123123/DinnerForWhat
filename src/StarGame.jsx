import React, { useState, useEffect, useRef } from 'react';
import { Box, Button, Typography, Snackbar } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

function StarGame() {
  const [gameState, setGameState] = useState('start');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(localStorage.getItem('starGameHighScore') || 0);
  const [error, setError] = useState(null);
  
  const canvasRef = useRef(null);
  const [playerPosition, setPlayerPosition] = useState({ x: 0, y: 0 });
  const [stars, setStars] = useState([]);
  const [velocity, setVelocity] = useState(0);
  const [jumping, setJumping] = useState(false);
  const [gameLoopId, setGameLoopId] = useState(null);
  const [canvasSize, setCanvasSize] = useState({ width: 300, height: 500 });
  const [backgroundStars, setBackgroundStars] = useState([]); // 背景星星数组

  // 初始化画布和游戏状态
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const width = window.innerWidth;
      const height = window.innerHeight - 56;
      canvas.width = width;
      canvas.height = height;
      setCanvasSize({ width, height });
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // 初始化背景星星
    initBackgroundStars();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(gameLoopId);
    };
  }, [gameLoopId]);

  // 初始化背景星星
  const initBackgroundStars = () => {
    const stars = [];
    for (let i = 0; i < 150; i++) {
      stars.push({
        x: Math.random() * canvasSize.width,
        y: Math.random() * canvasSize.height,
        size: 1 + Math.random(),
        speed: 0.1 + Math.random() * 0.2, // 缓慢的随机速度
        opacity: 0.5 + Math.random() * 0.5 // 随机透明度
      });
    }
    setBackgroundStars(stars);
  };

  // 开始游戏
  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setVelocity(0);
    setJumping(false);
    
    // 初始化玩家位置
    setPlayerPosition({ 
      x: canvasSize.width / 2, 
      y: canvasSize.height - 150 // 调整到更合适的初始位置
    });
    
    // 生成初始星星
    generateInitialStars();
    
    // 启动游戏循环
    const loopId = requestAnimationFrame(gameLoop);
    setGameLoopId(loopId);
  };

  // 生成初始星星
  const generateInitialStars = () => {
    const { width, height } = canvasSize;
    const newStars = [];

    // 底部固定星星（作为起点）
    newStars.push({
      x: width / 2,
      y: height - 100,
      size: 80,
      color: '#FFD700'
    });

    // 上方随机星星
    for (let i = 0; i < 8; i++) {
      newStars.push({
        x: 40 + Math.random() * (width - 80),
        y: height - 250 - i * 120,
        size: 60 + Math.random() * 40,
        color: '#FFD700'
      });
    }

    setStars(newStars);
  };

  // 游戏主循环
  const gameLoop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // 清空画布
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 绘制背景星星（缓慢移动）
    drawBackgroundStars(ctx);

    // 绘制玩家
    drawPlayer(ctx);

    // 绘制星星平台
    drawStars(ctx);

    // 更新玩家状态
    updatePlayerPosition();

    // 更新星星位置
    updateStarsPosition();

    // 检测碰撞
    checkCollision();

    // 继续游戏循环
    const loopId = requestAnimationFrame(gameLoop);
    setGameLoopId(loopId);
  };

  // 绘制玩家
  const drawPlayer = (ctx) => {
    // 绘制飞船形状
    ctx.fillStyle = '#4287F5';
    
    ctx.beginPath();
    ctx.moveTo(playerPosition.x, playerPosition.y - 20);
    ctx.lineTo(playerPosition.x - 15, playerPosition.y + 15);
    ctx.lineTo(playerPosition.x + 15, playerPosition.y + 15);
    ctx.closePath();
    ctx.fill();
    
    // 飞船窗户
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(playerPosition.x, playerPosition.y - 10, 5, 0, Math.PI * 2);
    ctx.fill();
    
    // 飞船火焰（移动时显示）
    if (velocity > 0) {
      ctx.fillStyle = '#FF5722';
      ctx.beginPath();
      ctx.moveTo(playerPosition.x - 8, playerPosition.y + 15);
      ctx.lineTo(playerPosition.x, playerPosition.y + 30);
      ctx.lineTo(playerPosition.x + 8, playerPosition.y + 15);
      ctx.closePath();
      ctx.fill();
    }
  };

  // 绘制星星平台（五角星）
  const drawStars = (ctx) => {
    stars.forEach(star => {
      drawStar(ctx, star.x, star.y, star.size, star.color);
    });
  };

  // 绘制单个五角星
  const drawStar = (ctx, cx, cy, size, color) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.fillStyle = color;
    ctx.beginPath();
    
    const outerRadius = size / 2;
    const innerRadius = outerRadius * 0.4;
    const angle = Math.PI / 5;
    
    for (let i = 0; i < 10; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const rad = angle * i - Math.PI / 2;
      ctx.lineTo(radius * Math.cos(rad), radius * Math.sin(rad));
    }
    
    ctx.closePath();
    ctx.fill();
    
    // 星星边缘高光
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.restore();
  };

  // 绘制背景星星（缓慢移动）
  const drawBackgroundStars = (ctx) => {
    // 更新背景星星位置
    setBackgroundStars(prev => prev.map(star => {
      let newX = star.x + star.speed;
      let newY = star.y;
      
      // 边界检查，超出画布则重置位置
      if (newX > canvasSize.width) {
        newX = 0;
        newY = Math.random() * canvasSize.height;
      }
      
      return { ...star, x: newX, y: newY };
    }));
    
    // 绘制背景星星
    backgroundStars.forEach(star => {
      ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
    });
  };

  // 更新玩家位置
  const updatePlayerPosition = () => {
    // 应用重力
    setVelocity(prev => prev + 0.6);
    setPlayerPosition(prev => ({
      ...prev,
      y: prev.y + velocity
    }));

    // 游戏结束检测
    if (playerPosition.y > canvasSize.height + 100) {
      endGame();
    }
  };

  // 更新星星位置
  const updateStarsPosition = () => {
    if (velocity < 0) { // 玩家上升时星星下移
      setStars(prev => prev.map(star => ({
        ...star,
        y: star.y - Math.abs(velocity) * 0.5
      })));
      
      // 更新分数
      setScore(prev => prev + Math.floor(Math.abs(velocity) * 0.2));
    }

    // 移除离开画布的星星并生成新星星
    const visibleStars = stars.filter(star => star.y < canvasSize.height + 100);
    
    while (visibleStars.length < 8) {
      visibleStars.push({
        x: 40 + Math.random() * (canvasSize.width - 80),
        y: -100 - Math.random() * 200,
        size: 60 + Math.random() * 40,
        color: '#FFD700'
      });
    }

    setStars(visibleStars);
  };

  // 碰撞检测
  const checkCollision = () => {
    const playerBottom = playerPosition.y + 15; // 玩家底部位置
    const playerLeft = playerPosition.x - 15;
    const playerRight = playerPosition.x + 15;

    stars.forEach(star => {
      // 简化的碰撞检测（针对五角星的外接矩形）
      const starTop = star.y - star.size / 2;
      const starBottom = star.y + star.size / 2;
      const starLeft = star.x - star.size / 2;
      const starRight = star.x + star.size / 2;

      // 检测玩家是否落在星星上
      if (playerBottom >= starTop && playerBottom <= starTop + 10 && 
          playerRight >= starLeft && playerLeft <= starRight &&
          velocity > 0) { // 只在下落时检测
        setJumping(true);
        setVelocity(-12); // 弹跳力
      }
    });
  };

  // 结束游戏
  const endGame = () => {
    cancelAnimationFrame(gameLoopId);
    setGameState('ended');
    
    // 更新最高分
    if (score > highScore) {
      localStorage.setItem('starGameHighScore', score);
      setHighScore(score);
    }
  };

  // 处理点击跳跃
  const handleJump = (e) => {
    if (gameState !== 'playing') return;
    
    // 获取点击位置并更新玩家水平位置
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    
    // 限制玩家移动范围
    const newX = Math.max(20, Math.min(canvasSize.width - 20, clickX));
    setPlayerPosition(prev => ({ ...prev, x: newX }));
    
    // 如果玩家正在接触星星，可以跳跃
    if (jumping) {
      setVelocity(-12);
    }
  };

  // 关闭错误提示
  const handleCloseError = () => {
    setError(null);
  };

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}>
      {/* 游戏画布 */}
      <canvas 
        ref={canvasRef} 
        onClick={handleJump}
        style={{ width: '100%', height: '100%', cursor: 'pointer' }}
      />

      {/* 游戏状态覆盖层 */}
      {gameState !== 'playing' && (
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          zIndex: 1
        }}>
          <Typography variant="h4" sx={{ color: '#fff', mb: 4, fontWeight: 'bold' }}>
            跳星星游戏
          </Typography>
          {gameState === 'start' && (
            <Button 
              variant="contained" 
              color="primary" 
              onClick={startGame}
              sx={{ 
                px: 8, 
                py: 3, 
                fontSize: '1.2rem', 
                borderRadius: 10,
                boxShadow: '0 4px 16px rgba(0, 123, 255, 0.3)',
                '&:hover': { boxShadow: '0 6px 20px rgba(0, 123, 255, 0.4)' }
              }}
            >
              开始游戏
            </Button>
          )}
          {gameState === 'ended' && (
            <Box textAlign="center" sx={{ color: '#fff' }}>
              <Typography variant="h5" mb={2} sx={{ fontWeight: 'bold' }}>游戏结束！</Typography>
              <Typography variant="body1" mb={4} sx={{ fontSize: '1.1rem' }}>
                得分：{score} <br />
                最高分：{highScore}
              </Typography>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={startGame}
                sx={{ 
                  px: 8, 
                  py: 3, 
                  fontSize: '1.2rem', 
                  borderRadius: 10,
                  boxShadow: '0 4px 16px rgba(0, 123, 255, 0.3)',
                  '&:hover': { boxShadow: '0 6px 20px rgba(0, 123, 255, 0.4)' }
                }}
              >
                再玩一次
              </Button>
            </Box>
          )}
        </Box>
      )}

      {/* 分数显示 */}
      {gameState === 'playing' && (
        <Typography 
          variant="h6" 
          sx={{ 
            position: 'absolute', 
            top: 20, 
            right: 20, 
            color: '#fff', 
            backgroundColor: 'rgba(0, 0, 0, 0.7)', 
            padding: '6px 16px', 
            borderRadius: 20,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
          }}
        >
          分数：{score}
        </Typography>
      )}

      {/* 错误提示 */}
      <Snackbar
        open={!!error}
        autoHideDuration={3000}
        onClose={handleCloseError}
        message={error}
        action={<Button color="inherit" size="small" onClick={handleCloseError}><CloseIcon /></Button>}
      />
    </Box>
  );
}

export default StarGame;