import React, { useEffect, useState, useRef } from 'react';

interface RoomManagerLayoutProps {
  roomHeader: React.ReactNode;
  filterHeader: React.ReactNode;
  scrollableContent: React.ReactNode;
  paginationFooter: React.ReactNode;
  modals?: React.ReactNode;
}

export const RoomManagerLayout: React.FC<RoomManagerLayoutProps> = ({
  roomHeader,
  filterHeader,
  scrollableContent,
  paginationFooter,
  modals,
}) => {
  const [contentStyle, setContentStyle] = useState<React.CSSProperties>({});
  const [filterTop, setFilterTop] = useState(70);
  const contentRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  const paginationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateContentArea = () => {
      if (headerRef.current && filterRef.current && paginationRef.current) {
        // 获取头部底部距离屏幕顶部的距离
        const headerBottom = headerRef.current.getBoundingClientRect().bottom;

        // 设置筛选头的top位置
        setFilterTop(headerBottom);

        // 获取筛选栏底部距离屏幕顶部的距离
        const filterBottom = filterRef.current.getBoundingClientRect().bottom;

        // 获取分页栏顶部距离屏幕顶部的距离
        const paginationTop = paginationRef.current.getBoundingClientRect().top;

        // 计算内容区域的可用高度
        const availableHeight = paginationTop - filterBottom;

        setContentStyle({
          marginTop: `${filterBottom}px`,
          marginBottom: `${window.innerHeight - paginationTop}px`,
          minHeight: `${availableHeight}px`
        });
      }
    };

    updateContentArea();

    const timer = setTimeout(updateContentArea, 100); // 等待DOM更新

    window.addEventListener('resize', updateContentArea);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateContentArea);
    };
  }, []);

  return (
    <div className="relative min-h-screen">
      {/* 全屏背景填充 */}
      <div className="fixed inset-0 bg-slate-800/40 z-0"></div>

      {/* Full width sticky header */}
      <div
        ref={headerRef}
        className="fixed top-0 left-0 right-0 z-30 bg-slate-950/70 backdrop-blur-xl border-b border-slate-700/30"
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div data-header-content>
            {roomHeader}
          </div>
        </div>
      </div>

      {/* Filter header (below main header) */}
      <div
        ref={filterRef}
        className="fixed left-0 right-0 z-[29] bg-slate-950/70 backdrop-blur-xl border-b border-slate-700/30"
        style={{ top: `${filterTop}px` }}
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div data-filter-content>
            {filterHeader}
          </div>
        </div>
      </div>

      {/* Main content area - 使用fixed定位和margin留白 */}
      <div
        ref={contentRef}
        className="fixed inset-0 z-20 overflow-y-auto"
      >
        <div
          className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-4"
          style={contentStyle}
        >
          {scrollableContent}
        </div>
      </div>

      {/* Overlay pagination container */}
      <div
        ref={paginationRef}
        className="fixed bottom-0 left-0 right-0 z-[28] bg-slate-950/60 backdrop-blur-xl border-t border-slate-700/30"
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div data-pagination-content>
            {paginationFooter}
          </div>
        </div>
      </div>

      {/* Modal container */}
      {modals && (
        <div className="relative z-[90]">
          {modals}
        </div>
      )}

      {/* Enhanced backdrop blur support */}
      <style jsx global>{`
        .backdrop-blur-xl {
          backdrop-filter: blur(16px) saturate(200%) brightness(1.1);
          -webkit-backdrop-filter: blur(16px) saturate(200%) brightness(1.1);
          background-color: rgba(15, 23, 42, 0.6);
        }

        @supports not (backdrop-filter: blur(16px)) {
          .backdrop-blur-xl {
            background: linear-gradient(
              to bottom,
              rgba(15, 23, 42, 0.85) 0%,
              rgba(15, 23, 42, 0.6) 100%
            );
          }
        }

        @media screen and (-webkit-min-device-pixel-ratio: 0) {
          .backdrop-blur-xl {
            -webkit-backdrop-filter: blur(16px);
            backdrop-filter: blur(16px);
          }
        }
      `}</style>
    </div>
  );
};