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
      {/* 自定义滚动条样式 */}
      <style jsx>{`
        .scrollable-content::-webkit-scrollbar {
          width: 8px;
        }

        .scrollable-content::-webkit-scrollbar-track {
          background: rgba(30, 41, 59, 0.5);
          border-radius: 4px;
        }

        .scrollable-content::-webkit-scrollbar-thumb {
          background: rgba(100, 116, 139, 0.6);
          border-radius: 4px;
          border: 2px solid rgba(30, 41, 59, 0.5);
        }

        .scrollable-content::-webkit-scrollbar-thumb:hover {
          background: rgba(148, 163, 184, 0.8);
        }

        /* Firefox 滚动条样式 */
        .scrollable-content {
          scrollbar-width: thin;
          scrollbar-color: rgba(100, 116, 139, 0.6) rgba(30, 41, 59, 0.5);
        }

        /* 移动端优化 */
        @media (max-width: 640px) {
          .scrollable-content {
            -webkit-overflow-scrolling: touch;
            scroll-behavior: smooth;
          }
        }
      `}</style>

      {children}
    </div>
  );
};