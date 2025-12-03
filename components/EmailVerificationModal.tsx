import React from 'react';
import { useCountdown } from '../hooks/useCountdown';

// 邮箱验证弹窗的变体类型
export type EmailVerificationVariant = 'registration-success' | 'login-check' | 'signup-check';

interface BaseEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  onResendEmail: () => Promise<void> | void;
  resendLoading?: boolean;
  initialCooldownSeconds?: number;
}

interface RegistrationSuccessProps extends BaseEmailModalProps {
  variant: 'registration-success';
}

interface LoginCheckProps extends BaseEmailModalProps {
  variant: 'login-check';
  onSwitchToLogin?: () => void;
}

interface SignupCheckProps extends BaseEmailModalProps {
  variant: 'signup-check';
  onSwitchToLogin?: () => void;
}

type EmailVerificationModalProps =
  | RegistrationSuccessProps
  | LoginCheckProps
  | SignupCheckProps;

/**
 * 统一的邮箱验证弹窗组件
 * 支持三种场景：注册成功、登录检查、注册检查
 */
export const EmailVerificationModal: React.FC<EmailVerificationModalProps> = (props) => {
  const { isOpen, onClose, email, onResendEmail, resendLoading = false, initialCooldownSeconds = 60 } = props;
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

  // 注册成功后的邮箱验证弹窗
  if (props.variant === 'registration-success') {
    const countdown = useCountdown({ initialTime: 60 });

    const handleResendEmail = async () => {
      if (countdown.isActive || props.resendLoading) return;

      try {
        await props.onResendEmail();
        countdown.start();
      } catch (error) {
        // Error handling is done in parent
      }
    };

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6 border border-gray-700">
          {/* 头部图标和标题 */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">🎉 注册成功！</h2>
            <p className="text-gray-300">验证邮件已发送到您的邮箱</p>
          </div>

          {/* 邮箱信息 */}
          <div className="bg-gray-700/50 rounded-lg p-4 mb-6 border border-gray-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">发送至邮箱</p>
                <p className="text-white font-medium">{email}</p>
              </div>
              <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          {/* 重要提示 */}
          <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-blue-300 font-medium mb-1">重要提示</p>
                <p className="text-blue-200 text-sm">⏰ 验证链接有效期为 <strong>24小时</strong>，请及时完成验证</p>
              </div>
            </div>
          </div>

          {/* 操作说明 */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center text-white font-bold text-xs">1</div>
              <p className="text-gray-300">检查您的邮箱（包括垃圾邮件文件夹）</p>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center text-white font-bold text-xs">2</div>
              <p className="text-gray-300">点击邮件中的验证链接</p>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center text-white font-bold text-xs">3</div>
              <p className="text-gray-300">返回这里登录您的账户</p>
            </div>
          </div>

          {/* 按钮组 */}
          <div className="space-y-3">
            <button
              onClick={handleResendEmail}
              disabled={props.resendLoading || countdown.isActive}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {props.resendLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  发送中...
                </div>
              ) : countdown.isActive ? (
                `📧 重新发送 (${countdown.timeLeft}s)`
              ) : (
                '📧 重新发送验证邮件'
              )}
            </button>

            <button
              onClick={onClose}
              className="w-full bg-gray-700 text-gray-300 py-3 px-4 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
            >
              知道了，稍后验证
            </button>
          </div>

          {/* 底部提示 */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              没有收到邮件？请检查垃圾邮件文件夹，或重新发送
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 未验证邮箱弹窗
  if (props.type === 'unverified-email') {
    const countdown = useCountdown({ initialTime: props.initialCooldownSeconds || 60 });

    const handleResendEmail = async () => {
      if (countdown.isActive || props.resendLoading) return;

      try {
        await props.onResendEmail();
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
                  <p className="text-yellow-200 font-medium">该邮箱已经注册，但是还未进行验证</p>
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
                disabled={props.resendLoading || countdown.isActive}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
              >
                {props.resendLoading ? (
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
  }

  // 已验证邮箱弹窗
  if (props.type === 'verified-email') {
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
                onClick={props.onSwitchToLogin}
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
  }

  return null;
};