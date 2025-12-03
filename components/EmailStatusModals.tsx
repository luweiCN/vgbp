import React from 'react';
import { useCountdown } from '../hooks/useCountdown';

interface UnverifiedEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  onResendEmail: () => void;
  resendLoading: boolean;
  initialCooldownSeconds?: number;
  confirmationLink?: string;
}

interface VerifiedEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  onSwitchToLogin: () => void;
}

/**
 * 未验证邮箱模态框
 * 当用户输入的邮箱已注册但未验证时显示
 */
export const UnverifiedEmailModal: React.FC<UnverifiedEmailModalProps> = ({
  isOpen,
  onClose,
  email,
  onResendEmail,
  resendLoading,
  initialCooldownSeconds = 0,
  confirmationLink
}) => {
  const countdown = useCountdown({ initialTime: initialCooldownSeconds });

  const handleResendEmail = async () => {
    if (countdown.isActive || resendLoading) return;

    try {
      await onResendEmail();
      countdown.start();
    } catch (error) {
      // Error handling is done in parent
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white">邮箱需要验证</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-yellow-400 mt-0.5 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <p className="text-yellow-200 font-medium">邮箱已注册但未验证</p>
                <p className="text-yellow-300 text-sm mt-1">
                  我们已经向 <span className="font-mono bg-yellow-900/30 px-1 rounded">{email}</span> 发送了验证邮件，请检查邮箱并点击验证链接。
                </p>
              </div>
            </div>
          </div>

          <div className="text-gray-300 text-sm">
            <p>📧 请检查您的邮箱（包括垃圾邮件文件夹）</p>
            <p>🔗 点击邮件中的验证链接完成验证</p>
            <p>⏱️ 验证成功后即可正常登录</p>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors text-sm"
            >
              我知道了
            </button>

            <button
              onClick={handleResendEmail}
              disabled={resendLoading || countdown.isActive}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
            >
              {resendLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  发送中...
                </>
              ) : countdown.isActive ? (
                `重新发送 (${countdown.timeLeft}s)`
              ) : (
                '重新发送邮件'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * 已验证邮箱模态框
 * 当用户在注册模式输入已验证的邮箱时显示
 */
export const VerifiedEmailModal: React.FC<VerifiedEmailModalProps> = ({
  isOpen,
  onClose,
  email,
  onSwitchToLogin
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white">邮箱已验证</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-green-400 mt-0.5 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-green-200 font-medium">邮箱已完成验证</p>
                <p className="text-green-300 text-sm mt-1">
                  <span className="font-mono bg-green-900/30 px-1 rounded">{email}</span> 已经验证，您可以直接登录。
                </p>
              </div>
            </div>
          </div>

          <div className="text-gray-300 text-sm">
            <p>✅ 您的邮箱已经完成验证</p>
            <p>👤 可以直接使用此邮箱登录</p>
            <p>🚀 开始使用 Vainglory BP 吧！</p>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors text-sm"
            >
              继续注册
            </button>

            <button
              onClick={onSwitchToLogin}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
            >
              立即登录
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};