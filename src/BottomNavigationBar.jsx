import React from 'react';
import { BottomNavigation, BottomNavigationAction } from '@mui/material';
import { useLocation } from'react-router-dom';
import MessageIcon from '@mui/icons-material/Message';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import FavoriteIcon from '@mui/icons-material/Favorite';
import PersonIcon from '@mui/icons-material/Person';

function BottomNavigationBar() {
    const location = useLocation();
    let value = 0;

    switch (location.pathname) {
        case '/messages':
            value = 0;
            break;
        case '/dish':
            value = 1;
            break;
        case '/unlike':
            value = 2;
            break;
        case '/user':
            value = 3;
            break;
        default:
            value = 0;
    }

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
        </BottomNavigation>
    );
}

export default BottomNavigationBar;