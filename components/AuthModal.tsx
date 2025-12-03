import React from 'react';
import { AuthForm } from './AuthForm';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-90 flex items-center justify-center p-4">
      <div className="relative max-w-md w-full mx-auto">
        <button
          onClick={onClose}
          className="absolute -top-2 -right-2 bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-white rounded-full p-2 transition-colors shadow-lg z-10"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <AuthForm onSuccess={() => {
          onSuccess?.();
          onClose();
        }} />
      </div>
    </div>
  );
};