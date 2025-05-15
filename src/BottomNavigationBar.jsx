import React, { useState, useEffect } from 'react';
import { BottomNavigation, BottomNavigationAction } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import MessageIcon from '@mui/icons-material/Message';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import FavoriteIcon from '@mui/icons-material/Favorite';
import PersonIcon from '@mui/icons-material/Person';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import BuildIcon from '@mui/icons-material/Build'; // 替换为可用的图标
import apiRequest from './api.js';

function BottomNavigationBar() {
    const location = useLocation();
    const navigate = useNavigate();
    const [value, setValue] = useState(0);
    const [hasLover, setHasLover] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        switch (location.pathname) {
            case '/messages':
                setValue(0);
                break;
            case '/dish':
                setValue(1);
                break;
            case '/order':
                setValue(2);
                break;
            case '/unlike':
                setValue(3);
                break;
            case '/tool': // 新增路径
                setValue(4);
                break;
            case '/user':
                setValue(5);
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
                borderTop: '1px solid #ccc'
            }}
        >
            <BottomNavigationAction
                label="消息"
                icon={<MessageIcon />}
                onClick={() => navigate('/messages')}
            />
            <BottomNavigationAction
                label="菜谱"
                icon={<MenuBookIcon />}
                onClick={() => navigate('/dish')}
            />
            {hasLover && !loading && (
                <BottomNavigationAction
                    label="餐厅"
                    icon={<RestaurantIcon />}
                    onClick={() => navigate('/order')}
                />
            )}
            <BottomNavigationAction
                label="喜好"
                icon={<FavoriteIcon />}
                onClick={() => navigate('/unlike')}
            />
            {/* 新增：使用 BuildIcon 作为工具箱图标 */}
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