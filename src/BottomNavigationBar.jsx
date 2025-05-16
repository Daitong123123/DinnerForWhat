import React, { useState, useEffect } from 'react';
import { BottomNavigation, BottomNavigationAction } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import MessageIcon from '@mui/icons-material/Message';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import FavoriteIcon from '@mui/icons-material/Favorite';
import PersonIcon from '@mui/icons-material/Person';
import BuildIcon from '@mui/icons-material/Build';
import apiRequest from './api.js';

function BottomNavigationBar() {
    const location = useLocation();
    const navigate = useNavigate();
    const [value, setValue] = useState(1);
    const [hasLover, setHasLover] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 简化路径判断逻辑，将/dish、/ordering、/unlike都映射到干饭选项
        switch (true) {
            case location.pathname === '/messages':
                setValue(0);
                break;
            case ['/dish', '/ordering', '/unlike'].includes(location.pathname):
                setValue(1);
                break;
            case location.pathname === '/tool':
                setValue(2);
                break;
            case location.pathname === '/user':
                setValue(3);
                break;
            default:
                setValue(0);
        }

        const cachedHasLover = localStorage.getItem('hasLover') === 'true';
        if (cachedHasLover) {
            setHasLover(true);
            setLoading(false);
            return;
        }

        const userId = localStorage.getItem('userId');
        if (userId) {
            checkLoverStatus(userId);
        } else {
            setLoading(false);
        }
    }, [location.pathname]);

    const checkLoverStatus = async (userId) => {
        try {
            const data = await apiRequest('/lover-ship', 'POST', { userId }, navigate);

            if (data) {
                const hasLover = data.friends && data.friends.length > 0;
                setHasLover(hasLover);
                localStorage.setItem('hasLover', hasLover);

                if (hasLover && data.friends[0]) {
                    localStorage.setItem('loverId', data.friends[0]);
                }
            }
        } catch (error) {
            console.error('查询情侣状态失败:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <BottomNavigation
            showLabels
            value={value}
            sx={{
                width: '100%',
                position: 'fixed',
                bottom: 0,
                background: 'linear-gradient(to top, #ffffff, #fff0f5)',
                borderTop: '1px solid #ffccd5',
                zIndex: 100,
                '& .Mui-selected': {
                    color: '#FF5E87',
                },
                '& .MuiBottomNavigationAction-label.Mui-selected': {
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                },
                '& .MuiBottomNavigationAction-label': {
                    transition: 'font-size 0.3s',
                    fontSize: '0.65rem',
                },
                '& .MuiBottomNavigationAction-root': {
                    padding: '6px 0 8px',
                    minWidth: 'auto',
                    maxWidth: 'none',
                    flex: '1',
                }
            }}
        >
            <BottomNavigationAction
                label="消息"
                icon={<MessageIcon sx={{ fontSize: 22 }} />}
                onClick={() => navigate('/messages')}
            />
            <BottomNavigationAction
                label="干饭"
                icon={<FastfoodIcon sx={{ fontSize: 22 }} />}
                onClick={() => navigate('/dish')}
            />
            <BottomNavigationAction
                label="工具箱"
                icon={<BuildIcon sx={{ fontSize: 22 }} />}
                onClick={() => navigate('/tool')}
            />
            <BottomNavigationAction
                label="用户"
                icon={<PersonIcon sx={{ fontSize: 22 }} />}
                onClick={() => navigate('/user')}
            />
        </BottomNavigation>
    );
}

export default BottomNavigationBar;    