import React, { useState, useCallback, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams, useNavigate, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import RoomsPage from './pages/RoomsPage';
import RoomPage from './pages/RoomPage';
import { ToastProvider, useToastContext } from './contexts/ToastContext';
import { ToastContainer } from './components/Toast';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { OfflineIndicator } from './components/OfflineIndicator';
import { I18nProvider } from './i18n/components/I18nProvider';
import { useAnalytics } from './services/analytics';
import { LanguageTracker } from './components/LanguageTracker';

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
  const isGitHubPages = import.meta.env.IS_GITHUB_PAGES === true ||
                      import.meta.env.IS_GITHUB_PAGES === 'true';

  // GitHub Pages 使用子路径，其他平台（Vercel）使用根路径
  const basename = isGitHubPages ? '/vgbp/' : '/';

  return (
    <ToastProvider>
      <I18nProvider>
        <LanguageTracker />
        <Router basename={basename}>
          <AppContent />
        </Router>
      </I18nProvider>
    </ToastProvider>
  );
};

const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showError, showSuccess, toasts, removeToast } = useToastContext();
  const analytics = useAnalytics();

  // 追踪页面访问
  useEffect(() => {
    analytics.pageView(location.pathname);
  }, [location, analytics]);

  // 应用启动追踪
  useEffect(() => {
    analytics.appStarted();
  }, [analytics]);

  // 追踪应用焦点状态
  useEffect(() => {
    const handleFocus = () => analytics.appFocused();
    const handleBlur = () => analytics.appBlurred();

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, [analytics]);

  // 处理进入房间
  const handleEnterRoom = useCallback((roomId: string) => {
    // 追踪房间加入事件
    analytics.roomJoined(roomId);
    // 使用 React Router 导航
    navigate(`/room/${roomId}`);
  }, [navigate, analytics]);

  // 处理本地模式
  const handleLocalMode = useCallback(() => {
    // 追踪本地模式启动
    analytics.localModeStarted();
    // 导航到本地模式页面（使用RoomPage，但没有房间ID）
    navigate('/room/local');
  }, [navigate, analytics]);

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

      {/* PWA Install Prompt */}
      <PWAInstallPrompt />

      {/* Offline Indicator */}
      <OfflineIndicator />
    </div>
  );
};

export default AppWithRouter;