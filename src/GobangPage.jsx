import React, { useState, useEffect } from'react';
import {
    Box,
    Typography,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Avatar
} from '@mui/material';
import { FaChessBoard } from'react-icons/fa';
import apiRequest from './api.js';
import { useNavigate, useLocation } from'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

const GobangPage = ({ selectedFriend }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const currentUserId = localStorage.getItem('userId');
    const [board, setBoard] = useState(Array(15).fill(Array(15).fill(null)));
    const [currentPlayer, setCurrentPlayer] = useState('black');
    const [gameOver, setGameOver] = useState(false);
    const [winner, setWinner] = useState(null);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [invitationCode, setInvitationCode] = useState('');
    const [selfInfo, setSelfInfo] = useState({ avatar: 'U', name: '你' });

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const code = searchParams.get('invitationCode');
        if (code) {
            // 验证邀请码有效性的逻辑，这里只是示例，实际需要调用后端接口验证
            setInvitationCode(code);
            // 可以在这里添加调用后端接口验证邀请码的逻辑
            console.log('收到邀请码:', code);
        }

        const fetchSelfInfo = async () => {
            try {
                const selfInfo = await apiRequest('/friend-info', 'GET', { userId: currentUserId }, navigate);
                if (selfInfo) {
                    setSelfInfo({
                        avatar: selfInfo.userNickName.charAt(0).toUpperCase(),
                        name: selfInfo.userNickName
                    });
                }
            } catch (error) {
                console.error('Error fetching self info:', error);
            }
        };
        fetchSelfInfo();
    }, [location, currentUserId, navigate]);

    const handleCellClick = (row, col) => {
        if (!gameOver && board[row][col] === null) {
            const newBoard = board.map((r, i) =>
                r.map((cell, j) => (i === row && j === col ? currentPlayer : cell))
            );
            setBoard(newBoard);
            if (checkWin(row, col, currentPlayer)) {
                setGameOver(true);
                setWinner(currentPlayer);
            } else {
                setCurrentPlayer(currentPlayer === 'black'? 'white' : 'black');
            }
        }
    };

    const checkWin = (row, col, player) => {
        const directions = [
            [1, 0], [0, 1], [1, 1], [1, -1]
        ];
        for (const [dx, dy] of directions) {
            let count = 1;
            // 正向检查
            for (let i = 1; i < 5; i++) {
                const newRow = row + i * dx;
                const newCol = col + i * dy;
                if (newRow >= 0 && newRow < 15 && newCol >= 0 && newCol < 15 && board[newRow][newCol] === player) {
                    count++;
                } else {
                    break;
                }
            }
            // 反向检查
            for (let i = 1; i < 5; i++) {
                const newRow = row - i * dx;
                const newCol = col - i * dy;
                if (newRow >= 0 && newRow < 15 && newCol >= 0 && newCol < 15 && board[newRow][newCol] === player) {
                    count++;
                } else {
                    break;
                }
            }
            if (count >= 5) {
                return true;
            }
        }
        return false;
    };

    const handleRestart = () => {
        setBoard(Array(15).fill(Array(15).fill(null)));
        setCurrentPlayer('black');
        setGameOver(false);
        setWinner(null);
    };

    const handleBack = () => {
        setShowConfirmDialog(true);
    };

    const handleConfirmBack = () => {
        navigate(-1);
    };

    const handleSendInvitation = async () => {
        if (selectedFriend) {
            const code = uuidv4();
            try {
                const response = await apiRequest('/send-message', 'POST', {
                    userIdFrom: currentUserId,
                    userIdTo: selectedFriend.id,
                    messageType: 'text',
                    messageContent: `来局五子棋，点击链接加入：${window.location.origin}/gobang?invitationCode=${code}`
                }, navigate);
                if (response && response.code === '200') {
                    console.log('邀请发送成功，邀请码:', code);
                    // 可以在这里将邀请码保存到本地或发送到后端关联用户
                }
            } catch (error) {
                console.error('发送游戏邀请请求出错:', error);
            }
        }
    };

    return (
        <Box
            sx={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                minHeight: '100vh',
                backgroundColor: '#f9f9f9',
                position: 'relative'
            }}
        >
            {/* 左上角显示对方头像和用户名 */}
            <Box
                sx={{
                    position: 'absolute',
                    top: 16,
                    left: 16,
                    display: 'flex',
                    alignItems: 'center'
                }}
            >
                <Avatar sx={{ mr: 8 }}>{selectedFriend ? selectedFriend.name.charAt(0).toUpperCase() : 'U'}</Avatar>
                <Typography variant="subtitle1">{selectedFriend ? selectedFriend.name : '等待对手加入'}</Typography>
            </Box>

            {/* 右下角显示自己的头像和用户名 */}
            <Box
                sx={{
                    position: 'absolute',
                    bottom: 16,
                    right: 16,
                    display: 'flex',
                    alignItems: 'center'
                }}
            >
                <Avatar sx={{ mr: 8 }}>{selfInfo.avatar}</Avatar>
                <Typography variant="subtitle1">{selfInfo.name}</Typography>
            </Box>

            <Box
                sx={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingTop: 80,
                    paddingBottom: 80
                }}
            >
                <Typography variant="h4" sx={{ mb: 2 }}>五子棋对战 - 对手: {selectedFriend ? selectedFriend.name : '等待对手加入'}</Typography>
                <Button variant="contained" onClick={handleSendInvitation} sx={{ mb: 2 }}>发送五子棋邀请</Button>
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(15, 30px)',
                        gridTemplateRows: 'repeat(15, 30px)',
                        gap: 0,
                        backgroundColor: '#d2b48c',
                        padding: 10,
                        borderRadius: 8,
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                        border: '1px solid #000',
                        position: 'relative'
                    }}
                >
                    {/* 绘制网格线 */}
                    {Array.from({ length: 14 }, (_, i) => (
                        <Box
                            key={`row-${i}`}
                            sx={{
                                position: 'absolute',
                                top: 10 + (i + 1) * 30,
                                left: 10,
                                width: 450,
                                height: 1,
                                backgroundColor: '#000',
                                zIndex: 1
                            }}
                        />
                    ))}
                    {Array.from({ length: 14 }, (_, i) => (
                        <Box
                            key={`col-${i}`}
                            sx={{
                                position: 'absolute',
                                top: 10,
                                left: 10 + (i + 1) * 30,
                                width: 1,
                                height: 450,
                                backgroundColor: '#000',
                                zIndex: 1
                            }}
                        />
                    ))}

                    {board.map((row, i) =>
                        row.map((cell, j) => (
                            <Box
                                key={`${i}-${j}`}
                                sx={{
                                    width: 28,
                                    height: 28,
                                    margin: 1,
                                    backgroundColor: cell === 'black'? '#000' : cell === 'white'? '#fff' : 'transparent',
                                    borderRadius: '50%',
                                    cursor: cell === null &&!gameOver? 'pointer' : 'default',
                                    '&:hover': {
                                        backgroundColor: cell === null &&!gameOver? '#ccc' : undefined
                                    },
                                    zIndex: 2
                                }}
                                onClick={() => handleCellClick(i, j)}
                            />
                        ))
                    )}
                </Box>
                {gameOver && (
                    <Typography variant="h5" sx={{ mt: 2 }}>
                        {winner === 'black'? '黑方' : '白方'} 获胜！
                    </Typography>
                )}
                <Box sx={{ mt: 2 }}>
                    <Button variant="contained" onClick={handleRestart} sx={{ mr: 2 }}>重新开始</Button>
                    <Button variant="contained" onClick={handleBack}>返回</Button>
                </Box>
            </Box>
            <Dialog
                open={showConfirmDialog}
                onClose={() => setShowConfirmDialog(false)}
                aria-labelledby="confirm-dialog-title"
                aria-describedby="confirm-dialog-description"
            >
                <DialogTitle id="confirm-dialog-title">确认返回</DialogTitle>
                <DialogContent>
                    <DialogContentText id="confirm-dialog-description">
                        确认要返回聊天页面吗？当前游戏进度将丢失。
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowConfirmDialog(false)}>取消</Button>
                    <Button onClick={handleConfirmBack}>确认</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default GobangPage;    