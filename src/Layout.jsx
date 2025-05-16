// Layout.jsx
import React from 'react';
import BottomNavigationBar from './BottomNavigationBar';

const Layout = ({ children }) => {
    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {children}
            <BottomNavigationBar />
        </div>
    );
};

export default Layout;