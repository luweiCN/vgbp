import React from 'react';

interface PaginationFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const PaginationFooter: React.FC<PaginationFooterProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`py-4 ${className}`}>
      {children}
    </div>
  );
};