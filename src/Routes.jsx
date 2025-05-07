import React from 'react';
import { Routes, Route } from 'react-router-dom';
import UploadPage from './UploadPage';
import DishPage from './DishPage';
import UnlikePage from './UnlikePage';
import LoginPage from './login/LoginPage';
import RegisterPage from './login/RegisterPage';
import PhoneBindingPage from './login/PhoneBindingPage';
import MessagesPage from './MessagesPage';
import UserInfoPage from './UserInfoPage';
import ModelManagementPage from './ModelManagerPage';
import AdminHome from './AdminHome';
import GomokuPage from './GomokuPage';
import OrderingPage from './OrderingPage';


const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/phone-binding" element={<PhoneBindingPage />} />
            <Route path="/admin/upload" element={<UploadPage />} />
            <Route path="/unlike" element={<UnlikePage />} />
            <Route path="/dish" element={<DishPage />} />
            <Route path="/order" element={<OrderingPage />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/user" element={<UserInfoPage />} />
            <Route path="/admin/model" element={<ModelManagementPage />} />
            <Route path="/admin" element={<AdminHome />} />
            <Route path="/gomoku" element={<GomokuPage />} />
            <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>
    );
};

export default AppRoutes;    