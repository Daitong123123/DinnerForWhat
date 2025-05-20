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
import BindLoverPage from './BindLoverPage';
import ToolPage from './toolspage/ToolPage';
import TranslateTool from './toolspage/TranslateTools';
import StarGame from './toolspage/StarGame';
import FoodPage from './FoodPage';
import AccountPage from './toolspage/AccountPage';
import LoveNotesPage from './toolspage/LoveNotesPage';
import TarotPage from './toolspage/TarotPage';
import FatePage from './toolspage/FatePage';
import HoroscopePage from './toolspage/HoroscopePage';

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/phone-binding" element={<PhoneBindingPage />} />
            <Route path="/admin/upload" element={<UploadPage />} />
            <Route path="/unlike" element={<FoodPage />} />
            <Route path="/dish" element={<FoodPage />} />
            <Route path="/order" element={<FoodPage />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/user" element={<UserInfoPage />} />
            <Route path="/admin/model" element={<ModelManagementPage />} />
            <Route path="/admin" element={<AdminHome />} />
            <Route path="/gomoku" element={<GomokuPage />} />
            <Route path="/bind-lover" element={<BindLoverPage />} />
            <Route path="/tool" element={<ToolPage />} />
            <Route path="/tool/translate" element={<TranslateTool />} />
            <Route path="/tool/star-game" element={<StarGame />} />
            <Route path="/tool/account" element={<AccountPage />} />
            <Route path="/tool/love-note" element={<LoveNotesPage />} />
            <Route path="/tool/tarot" element={<TarotPage />} />
            <Route path="/tool/horoscope" element={<HoroscopePage />} />
            <Route path="/tool/fate" element={<FatePage />} />
            <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>
    );
};

export default AppRoutes;    