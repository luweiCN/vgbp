import React, { useState, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
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
  const { showError, toasts, removeToast } = useToast();

  // 处理进入房间
  const handleEnterRoom = useCallback((roomId: string) => {
    // 使用 React Router 导航
    window.location.href = `/room/${roomId}`;
  }, []);

  // 处理本地模式
  const handleLocalMode = useCallback(() => {
    // 导航到本地模式页面（暂时使用房间页面）
    window.location.href = '/local';
  }, []);

  return (
    <Router>
      <div className="min-h-screen">
        <Routes>
          {/* 首页 */}
          <Route path="/" element={<HomePage onLocalMode={handleLocalMode} onEnterRoom={handleEnterRoom} />} />

          {/* 房间管理页面 */}
          <Route path="/rooms" element={<RoomsPage onEnterRoom={handleEnterRoom} />} />

          {/* 房间页面 */}
          <Route path="/room/:roomId" element={<RoomPageWrapper />} />

          {/* 本地模式页面 */}
          <Route
            path="/local"
            element={<RoomPage roomId="local" onBack={() => window.location.href = '/'} />}
          />

          {/* 默认重定向 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* Toast Container */}
        <ToastContainer
          toasts={toasts}
          onRemove={removeToast}
        />
      </div>
    </Router>
  );
};

export default AppWithRouter;