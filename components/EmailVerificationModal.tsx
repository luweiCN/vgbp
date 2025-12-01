import React from 'react';

interface EmailVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  onResendEmail: () => Promise<void>;
  resendLoading?: boolean;
}

export const EmailVerificationModal: React.FC<EmailVerificationModalProps> = ({
  isOpen,
  onClose,
  email,
  onResendEmail,
  resendLoading = false
}) => {
  console.log('🪟 EmailVerificationModal 渲染:', { isOpen, email });

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
            onClick={onResendEmail}
            disabled={resendLoading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {resendLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                发送中...
              </div>
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
};