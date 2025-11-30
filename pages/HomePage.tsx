import React from 'react';
import EntryPage from '../components/EntryPage';

interface HomePageProps {
  onLocalMode: () => void;
  onEnterRoom: (roomId: string) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onLocalMode, onEnterRoom }) => {
  const handleOnlineMode = () => {
    // 导航到房间管理页面
    window.location.href = '/rooms';
  };

  return <EntryPage onLocalMode={onLocalMode} onOnlineMode={handleOnlineMode} onEnterRoom={onEnterRoom} />;
};

export default HomePage;