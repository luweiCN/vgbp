import React from 'react';

interface ScrollableContentProps {
  children: React.ReactNode;
  className?: string;
}

export const ScrollableContent: React.FC<ScrollableContentProps> = ({
  children,
  className = '',
}) => {
  return (
    <div
      className={`scrollable-content ${className}`}
      style={{
        overflowY: 'hidden', // 由父容器控制滚动
        overflowX: 'hidden',
        WebkitOverflowScrolling: 'touch',
        scrollBehavior: 'smooth',
      }}
    >
      {children}
    </div>
  );
};