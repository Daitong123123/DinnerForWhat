// src/contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import baseUrl from '../config.js';

const AuthContext = createContext({
    user: null,
    spouse: null,
    loading: true,
    login: () => { },
    logout: () => { }
});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [spouse, setSpouse] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // 从localStorage加载用户信息
    useEffect(() => {
        const loadUser = async () => {
            try {
                // 获取并解析localStorage中的用户信息
                const userInfoStr = localStorage.getItem('userInfo');
                const spouseInfoStr = localStorage.getItem('spouseInfo');

                // 分别检查并设置user和spouse
                if (userInfoStr) {
                    const userData = JSON.parse(userInfoStr);
                    setUser(userData);
                }

                if (spouseInfoStr) {
                    const spouseData = JSON.parse(spouseInfoStr);
                    setSpouse(spouseData);
                }
            } catch (error) {
                console.error('解析用户信息失败:', error);
                // 清除可能损坏的数据
                localStorage.removeItem('userInfo');
                localStorage.removeItem('spouseInfo');
            } finally {
                setLoading(false); // 无论如何都结束加载状态
            }
        };

        loadUser();
    }, []);

    const login = async (loginData) => {
        try {
            const response = await fetch(`http://${baseUrl}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(loginData),
                credentials: 'include'
            });
            const result = await response.json();

            if (result.code === '200' && result.data) {
                const userData = result.data;

                // 使用JSON.stringify存储对象
                localStorage.setItem('userId', userData.userId);
                localStorage.setItem('userInfo', JSON.stringify(userData));
                localStorage.setItem('userNickName', userData.userName || userData.userId);
                setUser(userData);

                // 如果用户有配偶ID，获取并保存配偶信息
                if (userData.coupleId) {
                    const spouseResponse = await fetch(`http://${baseUrl}/getCouple?coupleId=${userData.coupleId}`, {
                        credentials: 'include'
                    });
                    const spouseResult = await spouseResponse.json();

                    if (spouseResult.code === '200' && spouseResult.data) {
                        const spouseData = spouseResult.data;
                        localStorage.setItem('spouseId', spouseData.userId);
                        localStorage.setItem('spouseInfo', JSON.stringify(spouseData));
                        setSpouse(spouseData);
                    }
                } else {
                    localStorage.setItem('spouseId', null);
                    localStorage.setItem('spouseInfo', null);
                    setSpouse(null);
                }

                navigate('/dish');
                return true;
            } else {
                throw new Error(result.message || '登录失败');
            }
        } catch (error) {
            console.error('登录出错:', error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('userId');
        localStorage.removeItem('userNickName');
        localStorage.removeItem('userInfo');
        localStorage.removeItem('spouseId');
        localStorage.removeItem('spouseInfo');
        setUser(null);
        setSpouse(null);
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{ user, spouse, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);