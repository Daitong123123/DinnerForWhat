import React, { useState, useEffect } from'react';
import { BottomNavigation, BottomNavigationAction } from '@mui/material';
import { useLocation, useNavigate } from'react-router-dom';
import MessageIcon from '@mui/icons-material/Message';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import FavoriteIcon from '@mui/icons-material/Favorite';
import PersonIcon from '@mui/icons-material/Person';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import apiRequest from './api.js'; // 导入统一的API请求方法

function BottomNavigationBar() {
    const location = useLocation();
    const navigate = useNavigate(); // 获取导航函数
    const [value, setValue] = useState(0);
    const [hasLover, setHasLover] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 根据路径更新当前选中项
        switch (location.pathname) {
            case '/messages':
                setValue(0);
                break;
            case '/dish':
                setValue(1);
                break;
            case '/unlike':
                setValue(2);
                break;
            case '/user':
                setValue(3);
                break;
            case '/order':
                setValue(4);
                break;
            default:
                setValue(0);
        }

        // 检查是否已缓存情侣状态
        const cachedHasLover = localStorage.getItem('hasLover') === 'true';
        if (cachedHasLover) {
            setHasLover(true);
            setLoading(false);
            return;
        }

        // 获取用户ID并查询情侣状态
        const userId = localStorage.getItem('userId');
        if (userId) {
            checkLoverStatus(userId);
        } else {
            setLoading(false);
        }
    }, [location.pathname]);

    // 使用统一API请求方法查询情侣状态
    const checkLoverStatus = async (userId) => {
        try {
            const data = await apiRequest('/lover-ship', 'POST', { userId }, navigate);
            
            if (data) {
                const hasLover = data.friends && data.friends.length > 0;
                
                setHasLover(hasLover);
                localStorage.setItem('hasLover', hasLover);
                
                // 如果有情侣，缓存情侣ID
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
                href="/messages"
            />
            <BottomNavigationAction
                label="菜谱"
                icon={<MenuBookIcon />}
                href="/dish"
            />
            <BottomNavigationAction
                label="喜好"
                icon={<FavoriteIcon />}
                href="/unlike"
            />
            <BottomNavigationAction
                label="用户"
                icon={<PersonIcon />}
                href="/user"
            />
            {/* 只有当用户有情侣时才显示餐厅选项 */}
            {hasLover && !loading && (
                <BottomNavigationAction
                    label="餐厅"
                    icon={<RestaurantIcon />}
                    href="/order"
                />
            )}
        </BottomNavigation>
    );
}

export default BottomNavigationBar;    