import React from 'react';
import { RoomManager } from '../components/RoomManager';

interface RoomsPageProps {
  onEnterRoom: (roomId: string) => void;
}

const RoomsPage: React.FC<RoomsPageProps> = ({ onEnterRoom }) => {
  return <RoomManager onEnterRoom={onEnterRoom} />;
};

export default RoomsPage;