import React, { useState, useEffect } from 'react';
import { Avatar } from '@mui/material';
import { getUrlByIconId, getUserInfo } from '../utils';
import { useAuth } from '../login/AuthContext';

// 恋爱记风格配色
const COLORS = {
  primary: '#FF5E87',
  secondary: '#FFB6C1',
  accent: '#FF85A2',
  light: '#FFF0F3',
  dark: '#333333'
};

function DynamicAvatar({ userId, size = 'md', handleClick, ...otherProps }) {
  const { user, spouse, loading: authLoading } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  // 确定要显示哪个用户的头像
  useEffect(() => {
    if (userId) {
      if (user && user.userId === userId) {
        setCurrentUser(user);
      } else if (spouse && spouse.userId === userId) {
        setCurrentUser(spouse);
      } else {
        const userData = getUserInfo(userId);
        setCurrentUser(userData);
      }
    } else {
      setCurrentUser(user);
    }
  }, [userId, user, spouse, authLoading]);

  // 当用户或iconId变化时，重新获取头像
  useEffect(() => {
    if (!currentUser || authLoading) {
      setAvatarUrl('');
      setLoading(true);
      return;
    }
    
    if (!currentUser.iconId) {
      setAvatarUrl('');
      setLoading(false);
      return;
    }
    
    // 从缓存中获取头像URL和过期时间
    const cachedData = localStorage.getItem(`avatar_${currentUser.iconId}`);
    
    if (cachedData) {
      try {
        const { url, expiresAt } = JSON.parse(cachedData);
        const now = Date.now();
        
        if (now < expiresAt) {
          setAvatarUrl(url);
          setLoading(false);
          return;
        } else {
          localStorage.removeItem(`avatar_${currentUser.iconId}`);
        }
      } catch (error) {
        console.error('解析缓存数据失败:', error);
        localStorage.removeItem(`avatar_${currentUser.iconId}`);
      }
    }
    
    // 从API获取头像URL
    const fetchAvatarUrl = async () => {
      try {
        const url = await getUrlByIconId(currentUser.iconId);
        if (url) {
          setAvatarUrl(url);
          const expiresAt = Date.now() + 30 * 60 * 1000;
          localStorage.setItem(
            `avatar_${currentUser.iconId}`, 
            JSON.stringify({ url, expiresAt })
          );
        }
      } catch (error) {
        console.error('获取头像URL失败:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAvatarUrl();
  }, [currentUser, authLoading]);

  // 头像加载失败时的回退处理
  const handleError = () => {
    setAvatarUrl('');
  };

  // 确定头像大小
  const sizeStyles = {
    sm: { width: 24, height: 24 },
    md: { width: 32, height: 32 },
    lg: { width: 48, height: 48 },
  };

  // 恋爱记风格样式
  const loveStyle = {
    // 添加恋爱记风格的阴影和边框
    boxShadow: '0 2px 4px rgba(255, 94, 135, 0.15)',
    border: '2px solid rgba(255, 255, 255, 0.5)', // 半透明白色边框
    transition: 'all 0.3s ease', // 添加过渡动画
    
    // 悬停效果
    '&:hover': {
      boxShadow: '0 4px 8px rgba(255, 94, 135, 0.25)',
      transform: 'scale(1.05)',
    }
  };

  // 骨架屏样式
  const skeletonStyle = {
    backgroundColor: COLORS.light,
    color: COLORS.secondary,
    boxShadow: '0 2px 4px rgba(255, 94, 135, 0.1)',
  };

  // 加载状态下的骨架屏
  if (loading && !avatarUrl) {
    return (
      <Avatar
        sx={{
          ...sizeStyles[size],
          ...skeletonStyle,
          ...otherProps.sx,
        }}
        {...otherProps}
      >
        {/* 骨架屏显示首字母或爱心图标 */}
        {currentUser && currentUser.userName 
          ? currentUser.userName.charAt(0).toUpperCase()
          : '💖'}
      </Avatar>
    );
  }

  return (
    <Avatar
      src={avatarUrl || undefined}
      onError={handleError}
      onClick={handleClick}
      sx={{
        ...sizeStyles[size],
        ...loveStyle,
        ...otherProps.sx,
        backgroundColor: otherProps.bgColor || COLORS.primary,
        color: 'white',
      }}
      {...otherProps}
    >
      {/* 没有头像时显示用户名首字母 */}
      {!avatarUrl && currentUser && currentUser.userName && 
        currentUser.userName.charAt(0).toUpperCase()}
    </Avatar>
  );
}

export default DynamicAvatar;
