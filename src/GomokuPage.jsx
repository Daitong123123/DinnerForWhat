import React, { useState, useEffect, useRef } from'react';
import {
    Box,
    Typography,
    Button,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    Paper,
    Avatar,
    Divider
} from '@mui/material';
import { useNavigate, useSearchParams } from'react-router-dom';
import apiRequest from './api.js';
import { Client } from '@stomp/stompjs';
import baseUrl from './config.js';

const BOARD_SIZE = 15;
const CELL_SIZE = 40;
// 增加的边界大小
const BORDER_SIZE = 20;

const GomokuPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [roomId, setRoomId] = useState('');
    const [invitationCode, setInvitationCode] = useState('');
    const [gameStatus, setGameStatus] = useState('waiting'); // waiting, playing, ended
    const [currentPlayer, setCurrentPlayer] = useState('');
    const [board, setBoard] = useState(Array(BOARD_SIZE).fill().map(() => Array(BOARD_SIZE).fill(null)));
    const [winner, setWinner] = useState('');

    const [opponentInfo, setOpponentInfo] = useState(null);
    const stompClient = useRef(null);
    const currentUserId = localStorage.getItem('userId');
    const currentUserNickname = localStorage.getItem('userNickName') || '玩家';


    useEffect(() => {
        const urlRoomId = searchParams.get('roomId');
        if (urlRoomId) {
            setRoomId(urlRoomId);
            connectWebSocket(urlRoomId);
            fetchRoomStatus();
        }
    }, []);

    const fetchOpponentInfo = async (playerIds) => {
        try {
            const opponentId = playerIds.find(id => id!== currentUserId);
            if (opponentId) {
                const response = await apiRequest('/friend-info', 'GET', { userId: opponentId }, navigate);
                if (response && response.userNickName) {
                    setOpponentInfo({
                        nickname: response.userNickName,
                        avatar: response.userNickName.charAt(0).toUpperCase()
                    });
                }
            } else {
                setOpponentInfo(null);
            }
        } catch (error) {
            console.error('获取对手信息失败:', error);
        }
    };

    // 连接WebSocket
    const connectWebSocket = (roomId) => {
        if (stompClient.current) {
            stompClient.current.deactivate();
        }

        const client = new Client({
            brokerURL: `ws://${baseUrl}/chat-websocket`,
            reconnectDelay: 5000,
            onConnect: () => {
                client.subscribe(`/topic/gomoku/${roomId}`, (message) => {
                    const data = JSON.parse(message.body);
                    // 收到 WebSocket 消息时调用 status 接口
                    fetchRoomStatus();
                    handleGameUpdate(data);
                    if (data.messageType === 'onStart') {
                        setCurrentPlayer(data.userId);
                    } else if (data.messageType === 'onMove') {
                        setCurrentPlayer(data.userId);
                        if(data.hasWinner){
                            setWinner(data.winnerId);
                        }
                    }
                });
            },
            onStompError: (frame) => {
                console.error('WebSocket连接错误:', frame);
            }
        });

        client.activate();
        stompClient.current = client;
    };

    // 获取房间状态
    const fetchRoomStatus = async () => {
        try {
            const response = await apiRequest('/api/gomoku/room/status', 'GET', { roomId: searchParams.get('roomId') }, navigate);
            if (response && response.room) {
                // 更新对方头像
                if (response.room.playerIds) {
                    fetchOpponentInfo(response.room.playerIds);
                }
                handleGameUpdate(response.room);
            }
        } catch (error) {
            console.error('获取房间状态失败:', error);
        }
    };

    // 处理游戏状态更新
    const handleGameUpdate = async (data) => {
        if (data.gameStatus === 'playing') {
            setGameStatus('playing');
            if (data.board) {
                setBoard(data.board);
            }
            if (data.playerIds) {
                fetchOpponentInfo(data.playerIds);
            }
        } else if (data.gameStatus === 'ended') {
            if (data.board) {
                setBoard(data.board);
            }
            setGameStatus('ended');
            setWinner(data.winnerId);
        }
    };

    // 开始游戏
    const handleStartGame = async () => {
        try {
            const response = await apiRequest('/api/gomoku/game/start', 'GET', { roomId }, navigate);
            if (response && response.success) {
                setGameStatus('playing');
                setCurrentPlayer(response.firstId);
            }
        } catch (error) {
            console.error('开始游戏失败:', error);
        }
    };

    // 落子
    const handleMakeMove = async (x, y) => {
        if (gameStatus!== 'playing' || currentPlayer!== currentUserId || board[x][y]) {
            return;
        }

        try {
            const response = await apiRequest('/api/gomoku/game/move', 'GET', {
                roomId,
                userId: currentUserId,
                x,
                y
            }, navigate);
            if (response && response.moveSuccess) {
                fetchRoomStatus();
            }
        } catch (error) {
            console.error('落子失败:', error);
        }
    };

    // 离开房间
    const handleExitRoom = async () => {
        try {
            const response = await apiRequest('/api/gomoku/room/exit', 'GET', { userId: currentUserId, roomId }, navigate);
            if (response.success) {
                setRoomId('');
                setInvitationCode('');
                setGameStatus('waiting');
                setBoard(Array(BOARD_SIZE).fill().map(() => Array(BOARD_SIZE).fill(null)));
                setWinner('');
                setOpponentInfo(null);
                if (stompClient.current) {
                    stompClient.current.deactivate();
                    stompClient.current = null;
                }
                navigate('/messages');
            } else {
                console.error('离开房间失败:', response);
            }
        } catch (error) {
            console.error('离开房间失败:', error);
        }
    };

    // 渲染棋盘
    const renderBoard = () => {
        const centerIndex = Math.floor(BOARD_SIZE / 2);
        return (
            <Box
                sx={{
                    background: '#d4a76a',
                    borderRadius: '10px',
                    boxShadow: '0 0 20px rgba(0, 0, 0, 0.3)',
                    position: 'relative',
                    width: `${(BOARD_SIZE ) * CELL_SIZE + 2 * BORDER_SIZE}px`,
                    height: `${(BOARD_SIZE) * CELL_SIZE + 2 * BORDER_SIZE}px`,
                    margin: '0 auto',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}
            >
                <Grid
                    container
                    spacing={0}
                    style={{
                        width: `${(BOARD_SIZE ) * CELL_SIZE}px`,
                        height: `${(BOARD_SIZE ) * CELL_SIZE}px`,
                        position: 'relative'
                    }}
                >
                    {/* 天元点 */}
                    <div
                        style={{
                            position: 'absolute',
                            top: `${centerIndex * CELL_SIZE + BORDER_SIZE - 3}px`,
                            left: `${centerIndex * CELL_SIZE + BORDER_SIZE - 3}px`,
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            backgroundColor: '#000'
                        }}
                    />
                    {board.map((row, rowIndex) => (
                        <Grid container item key={rowIndex} spacing={0}>
                            {row.map((cell, colIndex) => (
                                <Grid item key={colIndex}>
                                    <div
                                        style={{
                                            width: CELL_SIZE,
                                            height: CELL_SIZE,
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            cursor: gameStatus === 'playing' && currentPlayer === currentUserId? 'pointer' : 'default'
                                        }}
                                        onClick={() => handleMakeMove(rowIndex, colIndex)}
                                    >
                                        {cell && (
                                            <div
                                                style={{
                                                    position: 'absolute',
                                                    top: `${rowIndex * CELL_SIZE + BORDER_SIZE - CELL_SIZE * 0.4}px`,
                                                    left: `${colIndex * CELL_SIZE + BORDER_SIZE - CELL_SIZE * 0.4}px`,
                                                    width: CELL_SIZE * 0.8,
                                                    height: CELL_SIZE * 0.8,
                                                    borderRadius: '50%',
                                                    backgroundColor: cell === 2? '#fff' : '#000',
                                                    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.3)',
                                                    border: '2px solid rgba(255, 255, 255, 0.5)'
                                                }}
                                            />
                                        )}
                                    </div>
                                </Grid>
                            ))}
                        </Grid>
                    ))}
                    {/* 网格线 */}
                    <div
                        style={{
                            position: 'absolute',
                            top: BORDER_SIZE,
                            left: BORDER_SIZE,
                            right: BORDER_SIZE,
                            bottom: BORDER_SIZE,
                            backgroundImage: `
                              linear-gradient(#000 1px, transparent 1px),
                              linear-gradient(90deg, #000 1px, transparent 1px)
                            `,
                            backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`,
                            backgroundPosition: `0 0`,
                            pointerEvents: 'none'
                        }}
                    />
                    <div
                        style={{
                            position: 'absolute',
                            top: BORDER_SIZE,
                            left: BORDER_SIZE,
                            right: BORDER_SIZE,
                            bottom: BORDER_SIZE,
                            content: '""',
                            pointerEvents: 'none'
                        }}
                    >
                        <div
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                borderBottom: '1px solid #000'
                            }}
                        />
                        <div
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                bottom: 0,
                                borderRight: '1px solid #000'
                            }}
                        />
                        <div
                            style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                borderTop: '1px solid #000'
                            }}
                        />
                        <div
                            style={{
                                position: 'absolute',
                                top: 0,
                                right: 0,
                                bottom: 0,
                                borderLeft: '1px solid #000'
                            }}
                        />
                    </div>
                </Grid>
            </Box>
        );
    };

    return (
        <Box
            sx={{
                p: 3,
                position: 'relative',
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                backgroundColor: '#f5f5f5'
            }}
        >
            <Box
                sx={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px'
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2
                    }}
                >
                    {opponentInfo? (
                        <Avatar
                            sx={{
                                width: 80,
                                height: 80,
                                bgcolor: '#ff5722',
                                fontSize: '32px',
                                fontWeight: 'bold',
                                boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)'
                            }}
                        >
                            {opponentInfo.avatar}
                        </Avatar>
                    ) : (
                        <Avatar
                            sx={{
                                width: 80,
                                height: 80,
                                bgcolor: '#4caf50',
                                fontSize: '32px',
                                fontWeight: 'bold',
                                boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)'
                            }}
                        >
                            +
                        </Avatar>
                    )}
                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                        {opponentInfo? opponentInfo.nickname : '等待对手加入'}
                    </Typography>
                </Box>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2
                    }}
                >
                    <Avatar
                        sx={{
                            width: 80,
                            height: 80,
                            bgcolor: '#2196F3',
                            fontSize: '32px',
                            fontWeight: 'bold',
                            boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)'
                        }}
                    >
                        {currentUserNickname.charAt(0).toUpperCase()}
                    </Avatar>
                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                        {currentUserNickname}
                    </Typography>
                </Box>
            </Box>
            <Divider sx={{ width: '100%', marginBottom: '20px' }} />
            <Box
                sx={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    marginBottom: '20px'
                }}
            >
                {roomId && (
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6">房间ID: {roomId}</Typography>
                        {invitationCode && <Typography variant="body1">邀请码: {invitationCode}</Typography>}
                        <Typography variant="body1">游戏状态: {gameStatus === 'waiting'? '等待开始' : gameStatus === 'playing'? '游戏中' : '已结束'}</Typography>
                        {gameStatus === 'playing' && (
                            <Typography variant="body1">当前回合: {currentPlayer === currentUserId? '你的回合' : '对方回合'}</Typography>
                        )}
                        {gameStatus === 'ended' && (
                            <Typography variant="body1">获胜者: {winner === currentUserId? '你赢了!' : '对方赢了'}</Typography>
                        )}
                    </Box>
                )}
            </Box>
            <Box
                sx={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    marginBottom: '20px'
                }}
            >
                {roomId && (gameStatus === 'waiting' || gameStatus === 'ended') && (
                    <Button variant="contained" onClick={handleStartGame} sx={{ mr: 2 }}>
                        开始游戏
                    </Button>
                )}
                {roomId && (
                    <Button variant="contained" onClick={handleExitRoom} sx={{ ml: 2 }}>
                        离开房间
                    </Button>
                )}
            </Box>
            {renderBoard()}
        </Box>
    );
};

export default GomokuPage;
    