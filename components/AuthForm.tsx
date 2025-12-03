import React, { useState, useCallback, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { EmailVerificationModal } from './EmailVerificationModal';
import { VerificationCodeForm } from './VerificationCodeForm';

interface AuthFormProps {
  onSuccess?: () => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({ onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showVerificationCodeForm, setShowVerificationCodeForm] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  // 新增状态：邮箱状态检查相关
  const [emailChecking, setEmailChecking] = useState(false);
  const [showUnverifiedModal, setShowUnverifiedModal] = useState(false);
  const [showVerifiedModal, setShowVerifiedModal] = useState(false);
  const [resendConfirmationLoading, setResendConfirmationLoading] = useState(false);
  const countdown = useCountdown({ initialTime: 60 });

  // 防抖引用
  const emailCheckTimeoutRef = useRef<NodeJS.Timeout>();

  const {
    signIn,
    signUp,
    resendVerificationEmail,
    sendVerificationCode,
    signUpWithVerificationCode,
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
            // 显示未验证模态框
            setShowUnverifiedModal(true);
            setRegisteredEmail(emailToCheck);
            break;
          case 'registered_verified':
            // 显示已验证模态框
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

  const handleResendVerification = async () => {
    if (!registeredEmail) {
      setError('请先输入邮箱地址');
      return;
    }

    setResendLoading(true);
    setError('');

    try {
      await resendVerificationEmail(registeredEmail);
      // 成功重新发送后，可以显示一个 toast 或者保持模态框打开
      // 这里我们可以暂时不显示额外信息，因为模态框本身已经包含了说明
    } catch (err: any) {
      setError(err.message || '重新发送验证邮件失败，请稍后重试。');
    } finally {
      setResendLoading(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
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
        const result = await signUp(email, password);
        console.log('✅ 注册完成，结果:', result);

        // 保存注册的邮箱
        setRegisteredEmail(email);

        // 检查是否需要验证码
        if (result?.needsVerificationCode) {
          // 需要验证码流程
          console.log('🔢 需要验证码，发送验证码...');
          const codeResult = await sendVerificationCode(email);

          if (codeResult.success) {
            setSuccessMessage(codeResult.message);
            setShowVerificationCodeForm(true);
          } else {
            setError(codeResult.message);
          }
        } else if (result?.isDuplicate) {
          // 重复邮箱，显示特殊提示
          const message = '📧 ' + (result.message || '检测到您的邮箱已注册，验证邮件已重新发送');
          setSuccessMessage(message);
          console.log('📧 显示重复邮箱提示:', message);
          setShowVerificationModal(true);
        } else {
          // 新用户注册成功
          const message = '🎉 注册成功！验证邮件已发送到您的邮箱。';
          setSuccessMessage(message);
          console.log('🎉 显示注册成功提示:', message);
          setShowVerificationModal(true);
        }

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

  // 处理验证码验证成功
  const handleVerificationSuccess = async () => {
    console.log('✅ 验证码验证成功，完成注册...');
    setShowVerificationCodeForm(false);

    try {
      // 这里需要用户重新输入密码来完成注册
      // 为了简化，我们可以让用户重新进行注册流程
      setSuccessMessage('验证码验证成功！请重新提交注册信息以完成账户创建。');
      setError('');
    } catch (err: any) {
      setError('完成注册时出错: ' + err.message);
    }
  };

  // 处理验证码表单取消
  const handleVerificationCancel = () => {
    setShowVerificationCodeForm(false);
    setSuccessMessage('');
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
            onChange={(e) => setPassword(e.target.value)}
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

      {/* 邮件验证模态框 */}
      <EmailVerificationModal
        type="registration-success"
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        email={registeredEmail}
        onResendEmail={handleResendVerification}
        resendLoading={resendLoading}
      />

      {/* 验证码表单 */}
      {showVerificationCodeForm && (
        <VerificationCodeForm
          email={registeredEmail}
          onVerified={handleVerificationSuccess}
          onCancel={handleVerificationCancel}
        />
      )}

      {/* 邮箱状态模态框 */}
      <UnverifiedEmailModal
        isOpen={showUnverifiedModal}
        onClose={() => setShowUnverifiedModal(false)}
        email={registeredEmail}
        onResendEmail={handleResendConfirmation}
        resendLoading={resendConfirmationLoading}
        cooldownSeconds={countdown.timeLeft}
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