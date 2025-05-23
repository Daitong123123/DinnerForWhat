import React, { useState, useEffect } from 'react';
import { Avatar } from '@mui/material';
import { getUrlByIconId } from '../utils';
import { useAuth } from '../login/AuthContext'; // 导入认证上下文

function DynamicAvatar({ userId, size = 'md', ...otherProps }) {
  const { user, spouse, loading: authLoading } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  // 确定要显示哪个用户的头像
  useEffect(() => {
    // 如果传入了userId，查找对应的用户
    if (userId) {
      // 检查是当前用户还是配偶
      if (user && user.userId === userId) {
        setCurrentUser(user);
      } else if (spouse && spouse.userId === userId) {
        setCurrentUser(spouse);
      } else {
        // 如果userId不匹配当前用户或配偶，可能是其他用户
        // 这里可以添加额外逻辑处理其他用户的情况
        console.warn(`找不到ID为${userId}的用户`);
        setCurrentUser(null);
      }
    } else {
      // 如果没有传入userId，默认显示当前用户
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
    
    // 如果iconId为空或不存在，直接显示首字母
    if (!currentUser.iconId) {
      setAvatarUrl('');
      setLoading(false);
      return;
    }
    
    // 从缓存中获取头像URL（如果有）
    const cachedUrl = localStorage.getItem(`avatar_${currentUser.iconId}`);
    if (cachedUrl) {
      setAvatarUrl(cachedUrl);
      setLoading(false);
      return;
    }
    
    // 从API获取头像URL
    const fetchAvatarUrl = async () => {
      try {
        const url = await getUrlByIconId(currentUser.iconId);
        if (url) {
          setAvatarUrl(url);
          // 缓存头像URL，减少API调用
          localStorage.setItem(`avatar_${currentUser.iconId}`, url);
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

  // 加载状态下的骨架屏
  if (loading && !avatarUrl) {
    return (
      <Avatar
        sx={{
          ...sizeStyles[size],
          ...otherProps.sx,
          backgroundColor: '#f0f0f0', // 骨架屏背景色
        }}
        {...otherProps}
      >
        {/* 加载状态下的占位符 */}
      </Avatar>
    );
  }

  return (
    <Avatar
      src={avatarUrl || undefined}
      onError={handleError}
      sx={{
        ...sizeStyles[size],
        ...otherProps.sx,
        backgroundColor: otherProps.bgColor || '#FF5E87', // 默认背景色
      }}
      {...otherProps}
    >
      {!avatarUrl && currentUser && currentUser.userName && currentUser.userName.charAt(0).toUpperCase()}
    </Avatar>
  );
}

export default DynamicAvatar;