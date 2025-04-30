import React from 'react';
import { Card, CardContent, Typography, Button, Avatar, Box, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import apiRequest from './api.js';
import { FaChessBoard } from 'react-icons/fa';

const GomokuInviteCard = ({ message, friend, onJoin , userIdTo}) => {
    const navigate = useNavigate();
    const currentUserId = localStorage.getItem('userId');
    const currentUserNickname = localStorage.getItem('userNickName') || '玩家';

    

    const handleJoinRoom = async () => {
            try {
                const response = await apiRequest('/api/gomoku/room/join', 'GET', {
                    userId: currentUserId,
                    invitationCode: message.inviteCode
                }, navigate);
                if (response && response.success) {
                    navigate(`/gomoku?roomId=${response.roomId}`);
                } else {
                    alert('加入房间失败');
                }
            } catch (error) {
                console.error('加入房间请求出错:', error);
            }
     
    };

    return (
        <Card 
            sx={{ 
                width: '100%', 
                margin: '8px 0',
                background: 'linear-gradient(135deg, #1a237e, #283593)',
                borderRadius: '16px',
                boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
                cursor: 'pointer',
                color: '#fff',
                '&:hover': {
                    boxShadow: '0 12px 24px rgba(0,0,0,0.4)',
                    transform: 'translateY(-2px)'
                },
                transition: 'all 0.3s ease'
            }}
        >
            <CardContent onClick={handleJoinRoom}>
                <Grid container alignItems="center" spacing={2} sx={{ mb: 2 }}>
                    <Grid item>
                        <Avatar sx={{ 
                            mr: 2, 
                            bgcolor: '#ff5722',
                            width: 48,
                            height: 48
                        }}>
                            <FaChessBoard size={24} />
                        </Avatar>
                    </Grid>
                    <Grid item xs>
                        <Typography variant="h5" sx={{ 
                            fontWeight: 'bold',
                            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                            color: '#ffeb3b'
                        }}>
                            {currentUserNickname} 向你发起五子棋挑战！
                        </Typography>
                        <Typography variant="subtitle1" sx={{ 
                            color: '#b3e5fc',
                            mt: 1,
                            display: 'flex',
                            flexDirection: 'row'
                        }}>
                            准备与 {friend.name} 一决高下
                        </Typography>
                    </Grid>
                </Grid>
                
                <Box sx={{ 
                    backgroundColor: 'rgba(255,255,255,0.1)', 
                    p: 2, 
                    borderRadius: '8px',
                    mb: 2
                }}>
                    <Typography variant="body1" sx={{ 
                        color: '#fff',
                        textAlign: 'center',
                        fontWeight: '500'
                    }}>
                        点击下方按钮立即加入游戏房间
                    </Typography>
                </Box>
                
                <Button 
                    variant="contained" 
                    color="secondary" 
                    fullWidth
                    sx={{ 
                        mt: 1,
                        py: 1.5,
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        background: 'linear-gradient(45deg, #ff5722, #ff9800)',
                        '&:hover': {
                            background: 'linear-gradient(45deg, #ff9800, #ff5722)'
                        }
                    }}
                >
                    立即加入战斗
                </Button>
            </CardContent>
        </Card>
    );
};

export default GomokuInviteCard;