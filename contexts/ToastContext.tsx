import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ToastItem, useToast as useToastHook } from '../hooks/useToast';

interface ToastContextType {
  toasts: ToastItem[];
  addToast: (message: string, type: ToastItem['type'], addedHeroIds?: string[], removedHeroIds?: string[]) => string;
  removeToast: (id: string) => void;
  showError: (message: string) => void;
  showSuccess: (message: string) => void;
  showWarning: (message: string) => void;
  showInfo: (message: string, addedHeroIds?: string[], removedHeroIds?: string[]) => void;
  clearAll: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToastContext = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToastContext must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const toastHook = useToastHook();

  const contextValue: ToastContextType = {
    ...toastHook,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
    </ToastContext.Provider>
  );
};