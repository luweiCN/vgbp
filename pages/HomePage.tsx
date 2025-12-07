import React from 'react';
import HomePageLayout from '../components/HomePageLayout';

interface HomePageProps {
  onLocalMode: () => void;
  onEnterRoom: (roomId: string) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onLocalMode, onEnterRoom }) => {
  return <HomePageLayout onLocalMode={onLocalMode} onEnterRoom={onEnterRoom} />;
};

export default HomePage;