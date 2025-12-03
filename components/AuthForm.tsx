import React, { useState, useCallback, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useCountdown } from '../hooks/useCountdown';
import { UnverifiedEmailModal, VerifiedEmailModal } from './EmailStatusModals';

interface AuthFormProps {
  onSuccess?: () => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({ onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [registeredEmail, setRegisteredEmail] = useState('');

  // 新增状态：邮箱状态检查相关
  const [emailChecking, setEmailChecking] = useState(false);
  const [showUnverifiedModal, setShowUnverifiedModal] = useState(false);
  const [showVerifiedModal, setShowVerifiedModal] = useState(false);
  const [resendConfirmationLoading, setResendConfirmationLoading] = useState(false);
  const [showRegistrationSuccess, setShowRegistrationSuccess] = useState(false);
  const countdown = useCountdown({ initialTime: 60 });

  // 防抖引用
  const emailCheckTimeoutRef = useRef<NodeJS.Timeout>();

  const {
    signIn,
    signUp,
    checkEmailRegistrationStatus,
    resendConfirmationEmailService
  } = useAuth();

  // 邮箱状态检查函数（带防抖）
  const checkEmailStatus = useCallback(async (emailToCheck: string) => {
    console.log('🔍 开始邮箱状态检查:', emailToCheck, '登录模式:', isLogin);

    if (!emailToCheck || !emailToCheck.includes('@') || isLogin) {
      console.log('⏭️ 跳过检查 - 邮箱格式不正确或在登录模式');
      return;
    }

    // 清除之前的定时器
    if (emailCheckTimeoutRef.current) {
      clearTimeout(emailCheckTimeoutRef.current);
    }

    // 设置新的定时器（500ms 防抖）
    emailCheckTimeoutRef.current = setTimeout(async () => {
      console.log('⏰ 防抖计时器触发，开始检查邮箱状态');
      setEmailChecking(true);
      setError('');

      try {
        console.log('📡 调用 checkEmailRegistrationStatus...');
        const status = await checkEmailRegistrationStatus(emailToCheck);
        console.log('📧 邮箱状态检查结果:', status);

        switch (status.status) {
          case 'not_registered':
            // 继续正常注册流程，不做任何处理
            break;
          case 'registered_unverified':
            // 显示未验证模态框（邮箱状态检查场景，不显示成功横幅）
            console.log('📧 邮箱状态检查：已注册但未验证，不显示成功横幅');
            setShowRegistrationSuccess(false);
            setShowUnverifiedModal(true);
            setRegisteredEmail(emailToCheck);
            break;
          case 'registered_verified':
            // 显示已验证模态框
            console.log('✅ 邮箱状态检查：已验证邮箱，显示登录提示');
            setShowVerifiedModal(true);
            setRegisteredEmail(emailToCheck);
            break;
        }
      } catch (err: any) {
        // 静默失败，不影响正常注册流程
      } finally {
        setEmailChecking(false);
      }
    }, 500);
  }, [isLogin, checkEmailRegistrationStatus]);

  // 邮箱输入处理
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    console.log('📧 邮箱输入变化:', newEmail, '当前模式:', isLogin ? '登录' : '注册');
    setEmail(newEmail);

    // 在注册模式下检查邮箱状态
    if (!isLogin && newEmail) {
      console.log('✅ 触发邮箱状态检查');
      checkEmailStatus(newEmail);
    } else {
      console.log('❌ 不触发检查 - 在登录模式或邮箱为空');
    }
  };

  
  // 重发确认邮件处理
  const handleResendConfirmation = async () => {
    if (!registeredEmail || countdown.isActive) return;

    setResendConfirmationLoading(true);
    setError('');

    try {
      const result = await resendConfirmationEmailService(registeredEmail);

      if (result.success) {
        // 启动倒计时
        countdown.start();
      } else {
        setError(result.message || '重发验证邮件失败');
      }
    } catch (err: any) {
      setError(err.message || '重发验证邮件时发生错误');
    } finally {
      setResendConfirmationLoading(false);
    }
  };

  // 切换到登录模式
  const handleSwitchToLogin = () => {
    setIsLogin(true);
    setShowVerifiedModal(false);
    setShowUnverifiedModal(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      if (isLogin) {
        await signIn(email, password);
        onSuccess?.();
      } else {
        console.log('🔄 开始注册流程，邮箱:', email);
        await signUp(email, password);
        console.log('✅ 注册完成');

        // 保存注册的邮箱
        setRegisteredEmail(email);

        // 显示注册成功提示
        const message = '🎉 注册成功！验证邮件已发送到您的邮箱。';
        setSuccessMessage(message);
        console.log('🎉 注册成功流程：设置显示成功横幅');
        console.log('📊 状态设置：showRegistrationSuccess = true, email =', email);
        setShowRegistrationSuccess(true);
        setShowUnverifiedModal(true);

        // 清空表单
        setEmail('');
        setPassword('');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  
  return (
    <div className="min-h-[400px] bg-gray-800 rounded-lg p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">
        {isLogin ? '登录' : '注册'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            邮箱
          </label>
          <input
            type="email"
            value={email}
            onChange={handleEmailChange}
            placeholder="请输入邮箱"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          {!isLogin && emailChecking && (
            <div className="text-blue-400 text-sm mt-1">
              正在检查邮箱状态...
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            密码
          </label>
          <input
            type="password"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            minLength={6}
          />
        </div>

        {error && (
          <div className="text-red-400 text-sm bg-red-900/20 border border-red-800 rounded p-3">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="text-green-400 text-sm bg-green-900/20 border border-green-800 rounded p-3 whitespace-pre-line">
            {successMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '处理中...' : (isLogin ? '登录' : '注册')}
        </button>
      </form>

      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={() => {
            setIsLogin(!isLogin);
            setError('');
          }}
          className="text-blue-400 hover:text-blue-300 text-sm"
        >
          {isLogin ? '没有账户？点击注册' : '已有账户？点击登录'}
        </button>
      </div>

      {/* 邮箱状态模态框 */}
      <UnverifiedEmailModal
        isOpen={showUnverifiedModal}
        onClose={() => setShowUnverifiedModal(false)}
        email={registeredEmail}
        onResendEmail={handleResendConfirmation}
        resendLoading={resendConfirmationLoading}
        cooldownSeconds={countdown.timeLeft}
        showSuccessBanner={showRegistrationSuccess}
      />

      <VerifiedEmailModal
        isOpen={showVerifiedModal}
        onClose={() => setShowVerifiedModal(false)}
        email={registeredEmail}
        onSwitchToLogin={handleSwitchToLogin}
      />
    </div>
  );
};