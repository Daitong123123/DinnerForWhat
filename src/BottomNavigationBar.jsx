// BottomNavigationBar.jsx
import React, { useState, useEffect } from 'react';
import { BottomNavigation, BottomNavigationAction } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import MessageIcon from '@mui/icons-material/Message';
import FastfoodIcon from '@mui/icons-material/Fastfood'; // 新图标，代表"干饭"
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
                background: '#fff',
                borderTop: '1px solid #ccc',
                zIndex: 100 // 确保导航栏在最上层
            }}
        >
            <BottomNavigationAction
                label="消息"
                icon={<MessageIcon />}
                onClick={() => navigate('/messages')}
            />
            <BottomNavigationAction
                label="干饭"
                icon={<FastfoodIcon />}
                onClick={() => navigate('/dish')} // 默认导航到/dish页面
            />
            <BottomNavigationAction
                label="工具箱"
                icon={<BuildIcon />}
                onClick={() => navigate('/tool')}
            />
            <BottomNavigationAction
                label="用户"
                icon={<PersonIcon />}
                onClick={() => navigate('/user')}
            />
        </BottomNavigation>
    );
}

export default BottomNavigationBar;