import React from 'react';
import { useNavigate } from 'react-router-dom';
import EntryPage from '../components/EntryPage';

interface HomePageProps {
  onLocalMode: () => void;
  onEnterRoom: (roomId: string) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onLocalMode, onEnterRoom }) => {
  const navigate = useNavigate();

  const handleOnlineMode = () => {
    // 直接导航到房间管理页面
    navigate('/rooms');
  };

  return <EntryPage onLocalMode={onLocalMode} onOnlineMode={handleOnlineMode} />;
};

export default HomePage;