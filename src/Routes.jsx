import React from 'react';
import { Routes, Route } from 'react-router-dom';
import UploadPage from './UploadPage';
import DishPage from './DishPage';
import UnlikePage from './UnlikePage';
import LoginPage from './login/LoginPage';
import RegisterPage from './login/RegisterPage';
import PhoneBindingPage from './login/PhoneBindingPage';
import MessagesPage from './MessagesPage';

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/phone-binding" element={<PhoneBindingPage />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/unlike" element={<UnlikePage />} />
            <Route path="/dish" element={<DishPage />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>
    );
};

export default AppRoutes;    