import React, { useState, useEffect } from 'react';
import { verificationService } from '../services/verificationService';

interface VerificationCodeFormProps {
  email: string;
  onVerified: () => void;
  onCancel: () => void;
}

export const VerificationCodeForm: React.FC<VerificationCodeFormProps> = ({
  email,
  onVerified,
  onCancel
}) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // 倒计时逻辑
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  // 处理验证码输入
  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // 只允许数字
    if (value.length <= 6) {
      setCode(value);
      setError('');
    }
  };

  // 验证验证码
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (code.length !== 6) {
      setError('请输入完整的6位验证码');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const result = await verificationService.verifyCode(email, code);

      if (result.success) {
        setSuccessMessage('✅ 验证成功！');
        setTimeout(() => {
          onVerified();
        }, 1000);
      } else {
        setError(result.message);
      }
    } catch (error: any) {
      setError(error.message || '验证失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 重新发送验证码
  const handleResend = async () => {
    if (timeLeft > 0) return;

    setResendLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const result = await verificationService.sendVerificationCode(email);

      if (result.success) {
        setSuccessMessage(result.message);
        setTimeLeft(60); // 60秒倒计时
        setCode(''); // 清空验证码输入
      } else {
        setError(result.message);
      }
    } catch (error: any) {
      setError(error.message || '发送失败，请重试');
    } finally {
      setResendLoading(false);
    }
  };

  // 格式化邮箱显示
  const formatEmail = (email: string) => {
    const [username, domain] = email.split('@');
    const maskedUsername = username.substring(0, 2) + '***' + username.substring(username.length - 1);
    return `${maskedUsername}@${domain}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6 border border-gray-700">
        {/* 头部 */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">验证您的邮箱</h2>
          <p className="text-gray-300">我们已向 {formatEmail(email)} 发送了验证码</p>
        </div>

        {/* 验证码输入表单 */}
        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              验证码
            </label>
            <div className="flex justify-center">
              <div className="flex space-x-2">
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength={1}
                    value={code[index] || ''}
                    onChange={(e) => {
                      const newCode = code.split('');
                      newCode[index] = e.target.value.replace(/\D/g, '');
                      const newCodeString = newCode.join('');
                      setCode(newCodeString);
                      setError('');

                      // 自动跳转到下一个输入框
                      if (e.target.value && index < 5) {
                        const nextInput = document.getElementById(`code-${index + 1}`) as HTMLInputElement;
                        nextInput?.focus();
                      }
                    }}
                    onPaste={(e) => {
                      e.preventDefault();
                      const pastedData = e.clipboardData.getData('text').replace(/\D/g, '');
                      if (pastedData.length === 6) {
                        setCode(pastedData);
                        setError('');
                      }
                    }}
                    id={`code-${index}`}
                    className="w-12 h-14 text-center text-lg font-bold bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                ))}
              </div>
            </div>
          </div>

          {error && (
            <div className="text-red-400 text-sm bg-red-900/20 border border-red-800 rounded p-3">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="text-green-400 text-sm bg-green-900/20 border border-green-800 rounded p-3">
              {successMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                验证中...
              </div>
            ) : (
              '验证'
            )}
          </button>
        </form>

        {/* 重新发送 */}
        <div className="mt-6 text-center">
          <button
            onClick={handleResend}
            disabled={resendLoading || timeLeft > 0}
            className="text-blue-400 hover:text-blue-300 text-sm disabled:text-gray-500 disabled:cursor-not-allowed"
          >
            {resendLoading ? (
              '发送中...'
            ) : timeLeft > 0 ? (
              `重新发送 (${timeLeft}s)`
            ) : (
              '没有收到验证码？重新发送'
            )}
          </button>
        </div>

        {/* 提示信息 */}
        <div className="mt-4 space-y-2">
          <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <div className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-blue-200 text-sm">
                验证码有效期为10分钟，请及时完成验证
              </p>
            </div>
          </div>
        </div>

        {/* 取消按钮 */}
        <div className="mt-6">
          <button
            onClick={onCancel}
            className="w-full bg-gray-700 text-gray-300 py-2 px-4 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  );
};