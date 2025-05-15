import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Snackbar
} from '@mui/material';
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
  
  // 初始化画布
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const resizeCanvas = () => {
      const width = window.innerWidth;
      const height = window.innerHeight - 56;
      canvas.width = width;
      canvas.height = height;
      setCanvasSize({ width, height });
      
      if (gameState === 'playing') {
        setPlayerPosition({ x: width / 2, y: height / 2 });
      }
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(gameLoopId);
    };
  }, [gameState, gameLoopId]);
  
  // 开始游戏
  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setPlayerPosition({ x: canvasSize.width / 2, y: canvasSize.height / 2 });
    setVelocity(0);
    setJumping(false);
    setStars([]);
    
    // 生成初始星星
    generateInitialStars();
    
    // 开始游戏循环
    const loopId = requestAnimationFrame(gameLoop);
    setGameLoopId(loopId);
  };
  
  // 游戏主循环
  const gameLoop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // 清空画布（黑色背景）
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制星空背景
    drawStarBackground(ctx);
    
    // 更新玩家位置
    updatePlayerPosition();
    
    // 绘制玩家
    drawPlayer(ctx);
    
    // 更新星星位置
    updateStars();
    
    // 绘制星星
    drawStars(ctx);
    
    // 检测碰撞
    checkCollision();
    
    // 继续游戏循环
    const loopId = requestAnimationFrame(gameLoop);
    setGameLoopId(loopId);
  };
  
  // 绘制星空背景
  const drawStarBackground = (ctx) => {
    ctx.fillStyle = '#fff';
    
    // 慢速移动的星空背景
    for (let i = 0; i < 100; i++) {
      const x = (Math.random() * canvasSize.width + Date.now() * 0.01) % canvasSize.width;
      const y = (Math.random() * canvasSize.height + Date.now() * 0.005) % canvasSize.height;
      
      ctx.beginPath();
      ctx.arc(x, y, Math.random() * 2, 0, Math.PI * 2);
      ctx.fill();
    }
  };
  
  // 绘制玩家
  const drawPlayer = (ctx) => {
    // 玩家飞船
    ctx.fillStyle = '#4287f5';
    
    // 绘制飞船形状
    ctx.beginPath();
    ctx.moveTo(playerPosition.x, playerPosition.y - 20);
    ctx.lineTo(playerPosition.x - 15, playerPosition.y + 15);
    ctx.lineTo(playerPosition.x + 15, playerPosition.y + 15);
    ctx.closePath();
    ctx.fill();
    
    // 绘制飞船窗户
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(playerPosition.x, playerPosition.y - 5, 5, 0, Math.PI * 2);
    ctx.fill();
  };
  
  // 生成初始星星
  const generateInitialStars = () => {
    const newStars = [];
    const { width, height } = canvasSize;
    
    // 生成底部的星星
    newStars.push({
      x: width / 2 - 40,
      y: height - 50,
      width: 80,
      height: 10,
      isStar: true // 标记为星星
    });
    
    // 生成随机星星
    for (let i = 0; i < 10; i++) {
      newStars.push({
        x: Math.random() * (width - 80),
        y: height - 100 - i * 80,
        width: 80, // 更大的星星
        height: 10,
        isStar: true // 标记为星星
      });
    }
    
    setStars(newStars);
  };
  
  // 绘制星星（改为五角星）
  const drawStars = (ctx) => {
    stars.forEach(star => {
      if (star.isStar) {
        drawStar(ctx, star.x + star.width / 2, star.y + star.height / 2, star.width / 2, 5);
      } else {
        // 普通平台
        ctx.fillStyle = '#f5a623';
        ctx.beginPath();
        ctx.rect(star.x, star.y, star.width, star.height);
        ctx.fill();
      }
    });
  };
  
  // 绘制五角星
  const drawStar = (ctx, cx, cy, outerRadius, numPoints) => {
    ctx.fillStyle = '#ffd700'; // 金黄色
    ctx.beginPath();
    
    const innerRadius = outerRadius / 2;
    const angle = Math.PI / 2 * 3;
    
    for (let i = 0; i < numPoints * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      
      angle += Math.PI / numPoints;
    }
    
    ctx.closePath();
    ctx.fill();
    
    // 添加星光效果
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
  };
  
  // 更新玩家位置
  const updatePlayerPosition = () => {
    // 应用重力
    setVelocity(prev => prev + 0.5);
    setPlayerPosition(prev => ({
      ...prev,
      y: prev.y + velocity
    }));
    
    // 限制玩家在画布内
    const { width, height } = canvasSize;
    
    // 左右边界检测
    if (playerPosition.x < 0) {
      setPlayerPosition(prev => ({ ...prev, x: width }));
    } else if (playerPosition.x > width) {
      setPlayerPosition(prev => ({ ...prev, x: 0 }));
    }
    
    // 游戏结束检测
    if (playerPosition.y > height) {
      endGame();
    }
  };
  
  // 更新星星位置
  const updateStars = () => {
    // 如果玩家上升，星星向下移动
    if (velocity < 0) {
      setStars(prev => prev.map(star => ({
        ...star,
        y: star.y - velocity * 0.5 // 星星移动速度是玩家的一半
      })));
      
      // 增加分数
      setScore(prev => prev + Math.floor(Math.abs(velocity) * 0.1));
      
      // 更新最高分
      if (score > highScore) {
        setHighScore(score);
        localStorage.setItem('starGameHighScore', score);
      }
    }
    
    // 移除离开画布的星星并生成新星星
    setStars(prev => {
      const { height } = canvasSize;
      const visibleStars = prev.filter(star => star.y < height);
      
      // 如果星星数量太少，生成新星星
      if (visibleStars.length < 8) {
        visibleStars.push({
          x: Math.random() * (canvasSize.width - 80),
          y: -50,
          width: 80, // 更大的星星
          height: 10,
          isStar: true // 全部生成五角星
        });
      }
      
      return visibleStars;
    });
  };
  
  // 检测碰撞
  const checkCollision = () => {
    const isColliding = stars.some(star => {
      return (
        playerPosition.x > star.x - 20 &&
        playerPosition.x < star.x + star.width + 20 &&
        playerPosition.y + 20 > star.y &&
        playerPosition.y + 20 < star.y + 10 &&
        velocity > 0
      );
    });
    
    if (isColliding) {
      setJumping(true);
      setVelocity(-12); // 反弹速度
    }
  };
  
  // 结束游戏
  const endGame = () => {
    cancelAnimationFrame(gameLoopId);
    setGameState('ended');
  };
  
  // 处理点击跳跃
  const handleJump = (e) => {
    if (gameState !== 'playing') return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    
    setPlayerPosition(prev => ({
      ...prev,
      x: clickX
    }));
    
    if (jumping) {
      setVelocity(-12);
    }
  };
  
  // 关闭错误提示
  const handleCloseError = () => {
    setError(null);
  };

  return (
    <Box sx={{ p: 0, width: '100%', height: '100vh', position: 'relative' }}>
      <Typography variant="h4" component="h1" sx={{ position: 'absolute', top: 20, left: 0, width: '100%', textAlign: 'center', color: '#fff', zIndex: 1 }}>
        跳星星游戏
      </Typography>
      
      <canvas 
        ref={canvasRef} 
        onClick={handleJump}
        style={{ 
          width: '100%', 
          height: '100%', 
          cursor: 'pointer',
          backgroundColor: '#000' 
        }}
      />
      
      {gameState !== 'playing' && (
        <Box 
          sx={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            width: '100%', 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            zIndex: 2
          }}
        >
          {gameState === 'start' && (
            <Box textAlign="center" p={4} sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 4, backdropFilter: 'blur(4px)' }}>
              <Typography variant="h5" mb={3} sx={{ color: '#fff' }}>准备好了吗？</Typography>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={startGame}
                sx={{
                  px: 8,
                  py: 3,
                  borderRadius: 100,
                  textTransform: 'none',
                  fontSize: '1.2rem',
                  fontWeight: '500',
                  boxShadow: '0 4px 12px rgba(0, 123, 255, 0.3)',
                  '&:hover': {
                    boxShadow: '0 6px 16px rgba(0, 123, 255, 0.4)'
                  }
                }}
              >
                开始游戏
              </Button>
            </Box>
          )}
          
          {gameState === 'ended' && (
            <Box textAlign="center" p={4} sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 4, backdropFilter: 'blur(4px)' }}>
              <Typography variant="h5" mb={2} sx={{ color: '#fff' }}>游戏结束!</Typography>
              <Typography variant="body1" mb={4} sx={{ color: '#fff' }}>
                得分: {score} <br />
                最高分: {highScore}
              </Typography>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={startGame}
                sx={{
                  px: 8,
                  py: 3,
                  borderRadius: 100,
                  textTransform: 'none',
                  fontSize: '1.2rem',
                  fontWeight: '500',
                  boxShadow: '0 4px 12px rgba(0, 123, 255, 0.3)',
                  '&:hover': {
                    boxShadow: '0 6px 16px rgba(0, 123, 255, 0.4)'
                  }
                }}
              >
                再来一次
              </Button>
            </Box>
          )}
        </Box>
      )}
      
      {gameState === 'playing' && (
        <Box 
          sx={{ 
            position: 'absolute', 
            top: 20, 
            right: 20, 
            backgroundColor: 'rgba(0, 0, 0, 0.5)', 
            color: '#fff', 
            padding: '8px 16px', 
            borderRadius: 100,
            zIndex: 1
          }}
        >
          <Typography variant="body1" fontWeight="bold">
            分数: {score}
          </Typography>
        </Box>
      )}
      
      <Snackbar
        open={!!error}
        autoHideDuration={3000}
        onClose={handleCloseError}
        message={error}
        action={
          <Button color="inherit" size="small" onClick={handleCloseError}>
            <CloseIcon />
          </Button>
        }
      />
    </Box>
  );
}

export default StarGame;