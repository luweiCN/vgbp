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
  // 检测是否是 GitHub Pages 构建
  // GitHub Pages 部署需要特殊的路径前缀 /vgbp/
  const isGitHubPages = import.meta.env.IS_GITHUB_PAGES === 'true';

  // GitHub Pages 使用子路径，其他平台（Vercel）使用根路径
  const basename = isGitHubPages ? '/vgbp/' : '/';

  // 运行时调试信息
  console.log('🚀 React Router 调试信息:');
  console.log('  hostname:', window.location.hostname);
  console.log('  pathname:', window.location.pathname);
  console.log('  IS_GITHUB_PAGES:', import.meta.env.IS_GITHUB_PAGES);
  console.log('  isGitHubPages:', isGitHubPages);
  console.log('  basename:', basename);

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