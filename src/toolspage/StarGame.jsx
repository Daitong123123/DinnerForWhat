import React, { useState, useEffect, useRef } from 'react';
import { Box, Button, Typography, Snackbar } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

function StarGame() {
    const [gameState, setGameState] = useState('start');
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(localStorage.getItem('starGameHighScore') || 0);
    const [error, setError] = useState(null);

    const canvasRef = useRef(null);
    const playerPosition = useRef({ x: 0, y: 0 });
    const playerVelocity = useRef({ x: 0, y: 0 }); // 使用二维速度向量
    const [stars, setStars] = useState([]);
    const gameLoopId = useRef(null);
    const [canvasSize, setCanvasSize] = useState({ width: 300, height: 500 });
    const backgroundStars = useRef([]);
    const gameStarted = useRef(false);
    const lastJumpDirection = useRef(0); // 记录上次跳跃方向，用于模拟惯性
    
    // 游戏配置参数
    const config = {
        gravity: 0.25, // 降低重力，模拟太空失重感
        jumpForce: 10, // 增加跳跃力
        starMinSize: 40, // 星星最小尺寸
        starMaxSize: 70, // 星星最大尺寸
        starMinDistance: 100, // 星星之间的最小距离
        starGenerationDistance: 200, // 星星生成的垂直距离
        playerInertia: 0.98, // 惯性系数
        scrollSpeedFactor: 0.5, // 屏幕滚动速度因子
        initialStars: 6, // 初始星星数量
    };

    // 初始化画布尺寸
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

        // 生成背景星星
        const stars = [];
        for (let i = 0; i < 100; i++) {
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: 1 + Math.random(),
                speed: 0.1 + Math.random() * 0.2, // 背景星星移动速度不同
            });
        }
        backgroundStars.current = stars;

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(gameLoopId.current);
        };
    }, []);

    // 开始游戏
    const startGame = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const width = canvas.width;
        const height = canvas.height;

        setGameState('playing');
        setScore(0);
        playerVelocity.current = { x: 0, y: 0 };
        gameStarted.current = false;

        // 初始化玩家位置（站在地球上）
        playerPosition.current = {
            x: width / 2,
            y: height - 100,
        };

        // 生成初始星星
        generateInitialStars();

        // 启动游戏循环
        gameLoopId.current = requestAnimationFrame(gameLoop);
    };

    // 生成初始星星
    const generateInitialStars = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
    
        const width = canvas.width;
        const height = canvas.height;
        const newStars = [];
    
        // 地球（底部固定星星）
        newStars.push({
            x: width / 2,
            y: height - 80,
            size: 80,
            color: '#00FF00',
            isEarth: true,
        });
    
        // 将屏幕高度分成4等分
        const segments = 4;
        const segmentHeight = height * 0.7 / segments; // 只使用屏幕下部70%的区域
        
        // 每个区域生成2个星星
        for (let i = 0; i < segments; i++) {
            const segmentStart = height - 80 - segmentHeight * (i + 1);
            const segmentEnd = segmentStart + segmentHeight;
            
            // 生成该区域的星星
            const segmentStars = generateStarPositions(
                2, // 每个区域2个星星
                width,
                height,
                segmentStart,
                segmentEnd
            );
            
            newStars.push(...segmentStars.map(pos => ({
                x: pos.x,
                y: pos.y,
                size: config.starMinSize + Math.random() * (config.starMaxSize - config.starMinSize),
                color: '#FFD700',
            })));
        }
    
        setStars(newStars);
    };

    // 生成合理分布的星星位置
    const generateStarPositions = (count, width, height, startY, endY) => {
        const positions = [];
        const attempts = 100; // 每个星星的最大尝试次数
        
        for (let i = 0; i < count; i++) {
            let validPosition = false;
            let attempt = 0;
            
            while (!validPosition && attempt < attempts) {
                // 随机生成位置
                const x = config.starMaxSize + Math.random() * (width - 2 * config.starMaxSize);
                const y = startY + Math.random() * (endY - startY);
                
                // 检查与已有星星的距离
                let tooClose = false;
                for (const pos of positions) {
                    const dx = x - pos.x;
                    const dy = y - pos.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    // 星星之间的最小距离基于它们的大小
                    const minDistance = (pos.size + config.starMaxSize) * 0.7 + config.starMinDistance;
                    
                    if (distance < minDistance) {
                        tooClose = true;
                        break;
                    }
                }
                
                if (!tooClose) {
                    validPosition = true;
                    positions.push({ x, y, size: config.starMinSize + Math.random() * (config.starMaxSize - config.starMinSize) });
                }
                
                attempt++;
            }
        }
        
        return positions;
    };

    // 游戏主循环
    const gameLoop = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        // 清空画布
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 绘制背景星星
        drawBackgroundStars(ctx);

        // 绘制星星平台
        drawStars(ctx);

        // 绘制玩家
        drawPlayer(ctx);

        // 如果游戏真正开始，更新玩家和星星位置
        if (gameStarted.current) {
            updatePlayerPosition();
            updateStarsPosition();
            checkCollision();
            generateNewStars();
        }

        // 继续游戏循环
        gameLoopId.current = requestAnimationFrame(gameLoop);
    };

    // 绘制玩家
    const drawPlayer = (ctx) => {
        ctx.fillStyle = '#4287F5';
        ctx.beginPath();
        ctx.moveTo(playerPosition.current.x, playerPosition.current.y - 20);
        ctx.lineTo(playerPosition.current.x - 15, playerPosition.current.y + 15);
        ctx.lineTo(playerPosition.current.x + 15, playerPosition.current.y + 15);
        ctx.closePath();
        ctx.fill();

        // 飞船窗户
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(playerPosition.current.x, playerPosition.current.y - 10, 5, 0, Math.PI * 2);
        ctx.fill();
    };

    // 绘制星星平台
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

    // 绘制背景星星
    const drawBackgroundStars = (ctx) => {
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowBlur = 2;

        backgroundStars.current.forEach(star => {
            // 使用不同速度移动背景星星，创造深度感
            const y = (star.y + playerVelocity.current.y * star.speed) % canvasSize.height;
            ctx.beginPath();
            ctx.arc(star.x, y, star.size, 0, Math.PI * 2);
            ctx.fill();
        });
    };

    // 更新玩家位置
    const updatePlayerPosition = () => {
        // 应用重力
        playerVelocity.current.y += config.gravity;
        
        // 应用水平惯性
        playerVelocity.current.x *= config.playerInertia;
        
        // 更新玩家位置
        playerPosition.current.x += playerVelocity.current.x;
        playerPosition.current.y += playerVelocity.current.y;

        // 屏幕边界检测
        if (playerPosition.current.x < 0) {
            playerPosition.current.x = canvasSize.width;
        } else if (playerPosition.current.x > canvasSize.width) {
            playerPosition.current.x = 0;
        }

        // 游戏结束条件
        if (playerPosition.current.y > canvasSize.height + 100 || playerPosition.current.y < -100) {
            endGame();
        }
    };

    // 更新星星位置（模拟屏幕滚动）
    const updateStarsPosition = () => {
        if (playerVelocity.current.y < 0) {
            // 玩家上升时，星星向下移动，创造上升的视觉效果
            const scrollAmount = Math.abs(playerVelocity.current.y) * config.scrollSpeedFactor;
            
            setStars(prev => prev.map(star => ({
                ...star,
                y: star.y + scrollAmount,
            })));

            // 更新分数
            setScore(prev => prev + Math.floor(scrollAmount * 0.1));
        }
    };

    // 生成新星星
    const generateNewStars = () => {
        // 移除离开屏幕的星星
        const visibleStars = stars.filter(star => star.y < canvasSize.height + 100);
        
        // 计算需要生成的新星星数量
        const starsToGenerate = config.initialStars + 1 - visibleStars.length;
        
        if (starsToGenerate > 0) {
            // 生成新星星位置
            const newPositions = generateStarPositions(
                starsToGenerate,
                canvasSize.width,
                canvasSize.height,
                -config.starGenerationDistance, // 屏幕上方
                0 // 屏幕顶部
            );
            
            // 添加新星星
            const newStars = newPositions.map(pos => ({
                x: pos.x,
                y: pos.y,
                size: pos.size,
                color: '#FFD700',
            }));
            
            setStars([...visibleStars, ...newStars]);
        }
    };

    // 碰撞检测
    const checkCollision = () => {
        const playerBottom = playerPosition.current.y + 15;
        const playerLeft = playerPosition.current.x - 15;
        const playerRight = playerPosition.current.x + 15;

        stars.forEach(star => {
            if (star.isEarth && gameStarted.current) return; // 游戏开始后忽略地球
            
            const starTop = star.y - star.size / 2;
            const starBottom = star.y + star.size / 2;
            const starLeft = star.x - star.size / 2;
            const starRight = star.x + star.size / 2;

            // 碰撞检测
            if (
                playerBottom >= starTop &&
                playerBottom <= starTop + 10 &&
                playerRight >= starLeft &&
                playerLeft <= starRight &&
                playerVelocity.current.y > 0
            ) {
                // 跳跃并设置水平方向惯性
                playerVelocity.current.y = -config.jumpForce;
                playerVelocity.current.x = lastJumpDirection.current * 2; // 水平惯性
            }
        });
    };

    // 结束游戏
    const endGame = () => {
        cancelAnimationFrame(gameLoopId.current);
        setGameState('ended');

        if (score > highScore) {
            localStorage.setItem('starGameHighScore', score);
            setHighScore(score);
        }
    };

// 处理点击跳跃 - 修改为抛物线移动
const handleJump = (e) => {
    if (gameState !== 'playing') return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    
    if (!gameStarted.current) {
        gameStarted.current = true; // 游戏真正开始
    }

    // 计算点击位置与玩家当前位置的差异
    const dx = clickX - playerPosition.current.x;
    const direction = dx > 0 ? 1 : -1;
    lastJumpDirection.current = direction;
    
    // 水平方向加速度（模拟抛物线）
    playerVelocity.current.x = dx * 0.02; // 调整系数控制水平速度
    
    // 如果玩家在地面或星星上，给予垂直向上的速度
    if (playerVelocity.current.y >= 0) {
        playerVelocity.current.y = -config.jumpForce;
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