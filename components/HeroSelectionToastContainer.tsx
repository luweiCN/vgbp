import React from 'react';
import HeroSelectionToast from './HeroSelectionToast';

interface HeroSelectionToastContainerProps {
  toasts: Array<{
    id: string;
    message: string;
    addedHeroIds?: string[];
    removedHeroIds?: string[];
  }>;
  onRemove: (id: string) => void;
}

const HeroSelectionToastContainer: React.FC<HeroSelectionToastContainerProps> = ({ toasts, onRemove }) => {
  return (
    <div className="fixed top-24 right-6 z-[60] space-y-3 pointer-events-none">
      {toasts.map((toast, index) => (
        <div 
          key={toast.id} 
          className="pointer-events-auto"
          style={{
            transform: `translateY(${index * 80}px)`,
            transition: 'transform 0.3s ease-out'
          }}
        >
          <HeroSelectionToast
            message={toast.message}
            addedHeroIds={toast.addedHeroIds}
            removedHeroIds={toast.removedHeroIds}
            onClose={() => onRemove(toast.id)}
          />
        </div>
      ))}
    </div>
  );
};

export default HeroSelectionToastContainer;