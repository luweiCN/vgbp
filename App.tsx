import React, { useState, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import RoomsPage from './pages/RoomsPage';
import RoomPage from './pages/RoomPage';
import { useToast } from './hooks/useToast';
import { ToastContainer } from './components/Toast';

// 房间页面包装组件
const RoomPageWrapper: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();

  if (!roomId) {
    return <Navigate to="/" replace />;
  }

  return (
    <RoomPage
      roomId={roomId}
      onBack={() => window.history.back()}
    />
  );
};

const AppWithRouter: React.FC = () => {
  // GitHub Pages 部署到 /vgbp/ 子路径时需要 basename
  // Vercel 部署使用根路径，不需要 basename
  const basename = import.meta.env.VERCEL === '1' ? '/' : '/vgbp/';

  return (
    <Router basename={basename}>
      <AppContent />
    </Router>
  );
};

const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const { showError, toasts, removeToast } = useToast();

  // 处理进入房间
  const handleEnterRoom = useCallback((roomId: string) => {
    // 使用 React Router 导航
    navigate(`/room/${roomId}`);
  }, [navigate]);

  // 处理本地模式
  const handleLocalMode = useCallback(() => {
    // 导航到本地模式页面（使用RoomPage，但没有房间ID）
    navigate('/room/local');
  }, [navigate]);

  return (
    <div className="min-h-screen">
      <Routes>
        {/* 首页 */}
        <Route path="/" element={<HomePage onLocalMode={handleLocalMode} onEnterRoom={handleEnterRoom} />} />

        {/* 房间管理页面 */}
        <Route path="/rooms" element={<RoomsPage onEnterRoom={handleEnterRoom} />} />

        {/* 房间页面 - 支持在线模式和本地模式 */}
        <Route path="/room/:roomId" element={<RoomPageWrapper />} />

        {/* 默认重定向 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Toast Container */}
      <ToastContainer
        toasts={toasts}
        onRemove={removeToast}
      />
    </div>
  );
};

export default AppWithRouter;