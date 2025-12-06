import React from "react";
import { X } from "lucide-react";
import { AuthForm } from "./AuthForm";
import { Icon } from "./ui/Icon";

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
          <Icon icon={X} preset="sm" />
        </button>

        <AuthForm
          onSuccess={() => {
            onSuccess?.();
            onClose();
          }}
        />
      </div>
    </div>
  );
};

