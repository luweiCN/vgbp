import React, { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  type: 'error' | 'success' | 'warning' | 'info';
  duration?: number;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({
  message,
  type,
  duration = 5000,
  onClose
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // 进入动画
    setIsVisible(true);

    // 自动关闭
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose();
    }, 300); // 匹配动画时间
  };

  const getToastStyles = () => {
    const baseStyles = "fixed top-4 right-4 z-[9999] max-w-sm p-4 rounded-lg shadow-xl border backdrop-blur-sm transform transition-all duration-300 ease-in-out";

    let typeStyles = "";
    let icon = "";

    switch (type) {
      case 'error':
        typeStyles = "bg-red-900/90 border-red-700 text-red-100";
        icon = "❌";
        break;
      case 'success':
        typeStyles = "bg-green-900/90 border-green-700 text-green-100";
        icon = "✅";
        break;
      case 'warning':
        typeStyles = "bg-yellow-900/90 border-yellow-700 text-yellow-100";
        icon = "⚠️";
        break;
      case 'info':
        typeStyles = "bg-blue-900/90 border-blue-700 text-blue-100";
        icon = "ℹ️";
        break;
      default:
        typeStyles = "bg-zinc-900/90 border-zinc-700 text-zinc-100";
        icon = "ℹ️";
    }

    const animationStyles = isVisible
      ? isLeaving
        ? "translate-x-full opacity-0 scale-95"
        : "translate-x-0 opacity-100 scale-100"
      : "translate-x-full opacity-0 scale-95";

    return `${baseStyles} ${typeStyles} ${animationStyles}`;
  };

  const formatMessage = (text: string) => {
    // 处理包含换行符的消息，将其转换为段落
    return text.split('\n').map((line, index) => (
      <p key={index} className={index > 0 ? "mt-1" : ""}>
        {line}
      </p>
    ));
  };

  return (
    <div className={getToastStyles()}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 text-xl">
          {type === 'error' && '❌'}
          {type === 'success' && '✅'}
          {type === 'warning' && '⚠️'}
          {type === 'info' && 'ℹ️'}
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium leading-relaxed">
            {formatMessage(message)}
          </div>
        </div>

        <button
          onClick={handleClose}
          className="flex-shrink-0 ml-2 text-zinc-400 hover:text-white transition-colors p-1 rounded-md hover:bg-white/10"
          aria-label="关闭"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

// Toast 容器组件
interface ToastContainerProps {
  toasts: Array<{
    id: string;
    message: string;
    type: 'error' | 'success' | 'warning' | 'info';
  }>;
  onRemove: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-2 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => onRemove(toast.id)}
          />
        </div>
      ))}
    </div>
  );
};

export { Toast, ToastContainer };