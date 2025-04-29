import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Grid, Paper, Avatar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import apiRequest from './api.js';
import { Client } from '@stomp/stompjs';
import baseUrl from './config.js';

const BOARD_SIZE = 15;
const CELL_SIZE = 40;

const GomokuPage = () => {
    const navigate = useNavigate();
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

    const fetchOpponentInfo = async (playerIds) => {
        try {
            const opponentId = playerIds.find(id => id !== currentUserId);
            if (opponentId) {
                const response = await apiRequest('/friend-info', 'GET', { userId: opponentId }, navigate);
                if (response && response.userNickName) {
                    setOpponentInfo({
                        nickname: response.userNickName,
                        avatar: response.userNickName.charAt(0).toUpperCase()
                    });
                }
            }
        } catch (error) {
            console.error('获取对手信息失败:', error);
        }
    };

    // 创建房间
    const handleCreateRoom = async () => {
        try {
            const response = await apiRequest('/api/gomoku/room/create', 'POST', { userId: currentUserId }, navigate);
            if (response && response.inviteCode) {
                setRoomId(response.roomId);
                setInvitationCode(response.inviteCode);
                connectWebSocket(response.roomId);

            }
        } catch (error) {
            console.error('创建房间失败:', error);
        }
    };

    // 加入房间
    const handleJoinRoom = async () => {
        try {
            const response = await apiRequest('/api/gomoku/room/join', 'POST', { 
                userId: currentUserId, 
                invitationCode: invitationCode 
            }, navigate);
            if (response && response.success) {
                setRoomId(response.roomId);
                connectWebSocket(response.roomId);

            }
        } catch (error) {
            console.error('加入房间失败:', error);
        }
    };

    // 连接WebSocket
    const connectWebSocket = (roomId) => {
        if (stompClient.current) {
            stompClient.current.deactivate();
        }

        const client = new Client({
            brokerURL: `ws://${baseUrl}/ws`,
            reconnectDelay: 5000,
            onConnect: () => {
                client.subscribe(`/topic/gomoku/${roomId}`, (message) => {
                    const data = JSON.parse(message.body);
                    handleGameUpdate(data);
                });
                fetchRoomStatus();
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
            const response = await apiRequest('/api/gomoku/room/status', 'GET', { roomId }, navigate);
            if (response && response.room) {
                handleGameUpdate(response.room);
            }
        } catch (error) {
            console.error('获取房间状态失败:', error);
        }
    };

    // 处理游戏状态更新
    const handleGameUpdate = (data) => {
        if (data.gameStatus === 'playing') {
            setGameStatus('playing');
            setCurrentPlayer(data.currentPlayer);
            if (data.board) {
                setBoard(data.board);
            }
            if (data.playerIds) {
                fetchOpponentInfo(data.playerIds);
            }
        } else if (data.gameStatus === 'ended') {
            setGameStatus('ended');
            setWinner(data.winnerId);
        }
    };

    // 开始游戏
    const handleStartGame = async () => {
        try {
            const response = await apiRequest('/api/gomoku/game/start', 'POST', { roomId }, navigate);
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
        if (gameStatus !== 'playing' || currentPlayer !== currentUserId || board[x][y]) {
            return;
        }

        try {
            const response = await apiRequest('/api/gomoku/game/move', 'POST', { 
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

    // 结束游戏
    const handleEndGame = async () => {
        try {
            await apiRequest('/api/gomoku/game/end', 'POST', { roomId, winnerId: winner }, navigate);
            setGameStatus('waiting');
            setRoomId('');
            setInvitationCode('');
            setBoard(Array(BOARD_SIZE).fill().map(() => Array(BOARD_SIZE).fill(null)));
            setWinner('');
            if (stompClient.current) {
                stompClient.current.deactivate();
                stompClient.current = null;
            }
        } catch (error) {
            console.error('结束游戏失败:', error);
        }
    };

    // 渲染棋盘
    const renderBoard = () => {
        return (
            <Box sx={{
                backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'600\' height=\'600\' viewBox=\'0 0 600 600\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Crect width=\'600\' height=\'600\' fill=\'%23d4a76a\'/%3E%3C/svg%3E")',
                padding: '20px',
                borderRadius: '10px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
                border: '4px solid #8B4513',
                position: 'relative',
                width: `${BOARD_SIZE * CELL_SIZE}px`,
                height: `${BOARD_SIZE * CELL_SIZE}px`,
                margin: '0 auto',
                overflow: 'hidden',
                aspectRatio: '1/1'
            }}>
                <Grid container spacing={0} style={{ 
                    width: '100%',
                    maxWidth: BOARD_SIZE * CELL_SIZE,
                    backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)',
                    backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`,
                    backgroundPosition: `${CELL_SIZE}px ${CELL_SIZE}px`,
                    border: '1px solid #000'
                }}>
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
                                            cursor: gameStatus === 'playing' && currentPlayer === currentUserId ? 'pointer' : 'default'
                                        }}
                                        onClick={() => handleMakeMove(rowIndex, colIndex)}
                                    >
                                        {cell && (
                                            <div style={{
                                                width: CELL_SIZE * 0.8,
                                                height: CELL_SIZE * 0.8,
                                                borderRadius: '50%',
                                                backgroundColor: cell === currentUserId ? '#2196F3' : '#F44336',
                                                boxShadow: '0 2px 5px rgba(0, 0, 0, 0.3)',
                                                border: '2px solid rgba(255, 255, 255, 0.5)'
                                            }} />
                                        )}
                                    </div>
                                </Grid>
                            ))}
                        </Grid>
                    ))}
                </Grid>
            </Box>
        );
    };

    return (
        <Box sx={{ p: 3, position: 'relative', height: '100vh' }}>
            {opponentInfo ? (
                <Box sx={{ 
                    position: 'absolute', 
                    top: 20, 
                    left: `calc(50% - ${BOARD_SIZE * CELL_SIZE / 2}px)`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    padding: '8px 16px',
                    borderRadius: '24px',
                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                    zIndex: 1000
                }}>
                    <Avatar sx={{ 
                        bgcolor: '#ff5722', 
                        width: 48, 
                        height: 48,
                        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)'
                    }}>
                        {opponentInfo ? opponentInfo.avatar : '?'}
                    </Avatar>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{opponentInfo ? opponentInfo.nickname : '等待对手'}</Typography>
                </Box>
            ) : (
                <Box sx={{ 
                    position: 'absolute', 
                    top: 20, 
                    left: 20,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    padding: '8px 16px',
                    borderRadius: '24px',
                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                    zIndex: 1000
                }}>
                    <Avatar sx={{ 
                        bgcolor: '#4caf50', 
                        width: 48, 
                        height: 48,
                        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)'
                    }}>
                        +
                    </Avatar>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>等待对手加入</Typography>
                </Box>
            )}
            
            <Box sx={{ 
                position: 'absolute', 
                bottom: 20, 
                right: 20,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                padding: '8px 16px',
                borderRadius: '24px',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                zIndex: 1000
            }}>
                <Avatar sx={{ 
                    bgcolor: '#2196F3', 
                    width: 48, 
                    height: 48,
                    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)'
                }}>
                    {currentUserNickname.charAt(0).toUpperCase()}
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{currentUserNickname}</Typography>
            </Box>

            
            {roomId && (
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6">房间ID: {roomId}</Typography>
                    {invitationCode && <Typography variant="body1">邀请码: {invitationCode}</Typography>}
                    <Typography variant="body1">游戏状态: {gameStatus === 'waiting' ? '等待开始' : gameStatus === 'playing' ? '游戏中' : '已结束'}</Typography>
                    {gameStatus === 'playing' && (
                        <Typography variant="body1">当前回合: {currentPlayer === currentUserId ? '你的回合' : '对方回合'}</Typography>
                    )}
                    {gameStatus === 'ended' && (
                        <Typography variant="body1">获胜者: {winner === currentUserId ? '你赢了!' : '对方赢了'}</Typography>
                    )}
                </Box>
            )}

            {roomId && gameStatus === 'waiting' && (
                <Button variant="contained" onClick={handleStartGame} sx={{ mb: 3 }}>开始游戏</Button>
            )}

            {gameStatus === 'ended' && (
                <Button variant="contained" onClick={handleEndGame} sx={{ mb: 3 }}>返回大厅</Button>
            )}

            {renderBoard()}

            
        </Box>
    );
};

export default GomokuPage;