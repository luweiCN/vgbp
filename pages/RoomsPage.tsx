import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RoomManager } from '../components/RoomManager';

interface RoomsPageProps {
  onEnterRoom: (roomId: string) => void;
}

const RoomsPage: React.FC<RoomsPageProps> = ({ onEnterRoom }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/');
  };

  return <RoomManager onEnterRoom={onEnterRoom} onBack={handleBack} />;
};

export default RoomsPage;