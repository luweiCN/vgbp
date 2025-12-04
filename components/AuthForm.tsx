import React, { useState, useCallback, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/i18n/hooks/useI18n";
import { UnverifiedEmailModal, VerifiedEmailModal } from "./EmailStatusModals";
import {
  checkEmailStatus,
  resendConfirmationEmail,
} from "../services/userCheckService";

interface AuthFormProps {
  onSuccess?: () => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({ onSuccess }) => {
  const { t } = useI18n();

  // 使用RoomManager的完整状态结构
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authFormData, setAuthFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    username: "",
  });
  const [authFormLoading, setAuthFormLoading] = useState(false);
  const [error, setError] = useState("");

  // 邮箱状态检查相关状态
  const [emailChecking, setEmailChecking] = useState(false);
  const [showUnverifiedModal, setShowUnverifiedModal] = useState(false);
  const [showVerifiedModal, setShowVerifiedModal] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [emailCheckResult, setEmailCheckResult] = useState<any>(null);
  const [resendConfirmationLoading, setResendConfirmationLoading] =
    useState(false);
  const [showRegistrationSuccessBanner, setShowRegistrationSuccessBanner] =
    useState(false);

  // 邮箱验证 Promise 状态
  const [emailVerificationPromise, setEmailVerificationPromise] = useState<{
    resolve: () => void;
    reject: (error: Error) => void;
  } | null>(null);

  // 密码显示状态
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const emailCheckTimeoutRef = useRef<NodeJS.Timeout>();

  const { signIn, signUp } = useAuth();

  // 组件卸载时清理 Promise
  useEffect(() => {
    return () => {
      // 如果组件卸载时还有未完成的 Promise，reject 它
      if (emailVerificationPromise) {
        emailVerificationPromise.reject(new Error('Component unmounted'));
      }
    };
  }, [emailVerificationPromise]);

  // 重置表单数据
  const resetForm = () => {
    setAuthFormData({
      email: "",
      password: "",
      confirmPassword: "",
      username: "",
    });
    setError("");
    setShowRegistrationSuccessBanner(false);
  };

  // RoomManager的邮箱状态检查函数
  const checkEmailRegistrationStatus = useCallback(
    async (email: string) => {
      if (!email) {
        return;
      }

      // 邮箱格式验证
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return;
      }

      try {
        const status = await checkEmailStatus(email);
        setEmailCheckResult(status);

        // 在注册和登录模式下都触发相应的弹窗
        switch (status.status) {
          case "registered_unverified":
            setShowUnverifiedModal(true);
            setRegisteredEmail(email);
            setShowRegistrationSuccessBanner(false); // 邮箱状态检查时不显示成功横幅
            break;
          case "registered_verified":
            // 只有在注册模式下才弹"已验证"的弹窗
            if (authMode === "register") {
              setShowVerifiedModal(true);
              setRegisteredEmail(email);
            }
            break;
        }
      } catch (err: any) {
        console.error("邮箱状态检查失败:", err);
        // 清除验证结果
        setEmailCheckResult(null);
      }
    },
    [authMode],
  );

  // RoomManager的邮箱输入处理
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setAuthFormData({ ...authFormData, email: newEmail });

    // 邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValidEmail = emailRegex.test(newEmail);

    // 如果邮箱格式无效，清空验证结果和相关状态
    if (!isValidEmail) {
      setEmailCheckResult(null);
      setShowUnverifiedModal(false);
      setShowVerifiedModal(false);
      setEmailChecking(false);
      // 清除之前的定时器
      if (emailCheckTimeoutRef.current) {
        clearTimeout(emailCheckTimeoutRef.current);
      }
      return;
    }

    // 在注册和登录模式下都检查邮箱状态
    if ((authMode === "register" || authMode === "login") && newEmail) {
      // 清除之前的定时器
      if (emailCheckTimeoutRef.current) {
        clearTimeout(emailCheckTimeoutRef.current);
      }

      // 设置新的定时器（500ms 防抖，等用户输入完成）
      emailCheckTimeoutRef.current = setTimeout(async () => {
        setEmailChecking(true);
        setError("");

        try {
          await checkEmailRegistrationStatus(newEmail);
        } catch (err: any) {
          console.error("邮箱状态检查失败:", err);
        } finally {
          setEmailChecking(false);
        }
      }, 500);
    }
  };

  // RoomManager的重发确认邮件处理
  const handleResendConfirmation = async () => {
    if (!registeredEmail) return;

    setResendConfirmationLoading(true);
    setError("");

    try {
      const result = await resendConfirmationEmail(registeredEmail);

      if (!result.success) {
        setError(result.message || t('ui.components.authForm.errors.resendFailed'));
      }
    } catch (err: any) {
      setError(err.message || t('ui.components.authForm.errors.resendFailed'));
    } finally {
      setResendConfirmationLoading(false);
    }
  };

  // RoomManager的切换到登录模式
  const handleSwitchToLogin = () => {
    setAuthMode("login");
    setShowVerifiedModal(false);
    setShowUnverifiedModal(false);
  };

  // RoomManager的认证处理函数
  const handleAuth = async () => {
    // 邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(authFormData.email)) {
      setError(t('ui.components.authForm.errors.emailInvalid'));
      return;
    }

    if (authMode === "register") {
      if (!authFormData.username.trim()) {
        setError(t('ui.components.authForm.errors.usernameRequired'));
        return;
      }

      if (authFormData.password !== authFormData.confirmPassword) {
        setError(t('ui.components.authForm.errors.passwordMismatch'));
        return;
      }
    }

    if (authFormData.password.length < 6) {
      setError(t('ui.components.authForm.errors.passwordTooShort'));
      return;
    }

    setAuthFormLoading(true);
    setError("");

    try {
      if (authMode === "login") {
        await signIn(authFormData.email, authFormData.password);
        resetForm();
        onSuccess?.();
      } else {
        const signUpResult = await signUp(
          authFormData.email,
          authFormData.password,
          authFormData.username,
        );
        console.log("📝 注册结果:", signUpResult);

        // 注册成功处理
        if (signUpResult.user) {
          console.log("🎉 注册成功");

          // 清空表单
          resetForm();

          // 如果注册成功但没有会话（需要验证邮箱），显示验证弹窗并等待验证完成
          if (!signUpResult.session) {
            // 显示验证弹窗
            setShowUnverifiedModal(true);
            setRegisteredEmail(authFormData.email);
            setShowRegistrationSuccessBanner(true); // 注册成功时显示成功横幅

            // 创建 Promise 并等待用户完成邮箱验证
            await new Promise<void>((resolve, reject) => {
              setEmailVerificationPromise({ resolve, reject });
            });
          }

          // 邮箱验证完成后调用回调
          onSuccess?.();
        } else {
          // 注册失败，不清空表单，不关闭弹窗，让用户重新尝试
          console.log("❌ 注册失败");
        }
      }
    } catch (err: any) {
      console.error("❌ 认证失败:", err);
      const errorMessage = err.message || t('ui.components.authForm.errors.submitFailed');
      setError(errorMessage);

      // 如果是注册失败，清除任何邮箱验证相关的状态
      if (authMode === "register") {
        setEmailCheckResult(null);
      }
    } finally {
      setAuthFormLoading(false);
    }
  };

  // 切换认证模式
  const handleModeSwitch = () => {
    setAuthMode(authMode === "login" ? "register" : "login");
    setError("");
  };

  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-8 max-w-md w-full mx-auto shadow-2xl">
      {/* 头部 */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-white">
          {authMode === "login" ? t('ui.components.authForm.title.login') : t('ui.components.authForm.title.register')}
        </h3>
        <p className="text-sm text-zinc-400 mt-1">
          {authMode === "login"
            ? t('ui.components.authForm.subtitle.login')
            : t('ui.components.authForm.subtitle.register')}
        </p>
      </div>

      {/* 模式切换 */}
      <div className="flex bg-zinc-700/50 rounded-lg p-1 mb-6 border border-zinc-600">
        <button
          onClick={() => setAuthMode("login")}
          className={`px-4 py-2.5 text-sm font-medium rounded-md transition-all duration-200 flex-1 ${
            authMode === "login"
              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
              : "text-zinc-400 hover:text-white hover:bg-zinc-600"
          }`}
        >
          {t('ui.components.authForm.actions.login')}
        </button>
        <button
          onClick={() => setAuthMode("register")}
          className={`px-4 py-2.5 text-sm font-medium rounded-md transition-all duration-200 flex-1 ${
            authMode === "register"
              ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg"
              : "text-zinc-400 hover:text-white hover:bg-zinc-600"
          }`}
        >
          {t('ui.components.authForm.actions.register')}
        </button>
      </div>

      {/* 表单 */}
      <div className="space-y-5">
        {/* 用户名字段（仅注册模式） */}
        {authMode === "register" && (
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              {t('ui.components.authForm.fields.username.label')} <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-zinc-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={authFormData.username}
                  onChange={(e) =>
                    setAuthFormData({
                      ...authFormData,
                      username: e.target.value,
                    })
                  }
                  className="w-full bg-zinc-700/50 border border-zinc-600 rounded-lg pl-10 pr-12 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                  placeholder={t('ui.components.authForm.fields.username.placeholder')}
                  required
                />
                {authFormData.username && (
                  <button
                    type="button"
                    onClick={() =>
                      setAuthFormData({
                        ...authFormData,
                        username: "",
                      })
                    }
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-white hover:bg-zinc-600 rounded-full p-1 transition-all duration-200"
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
                )}
              </div>
            </div>
            <div className="mt-1 text-xs text-zinc-500">
              {t('ui.components.authForm.fields.username.description')}
            </div>
          </div>
        )}

        {/* 邮箱字段 */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            {t('ui.components.authForm.fields.email.label')} <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-zinc-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div className="relative">
              <input
                type="email"
                value={authFormData.email}
                onChange={handleEmailChange}
                className="w-full bg-zinc-700/50 border border-zinc-600 rounded-lg pl-10 pr-12 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder={t('ui.components.authForm.fields.email.placeholder')}
                required
              />
              {authFormData.email && (
                <button
                  type="button"
                  onClick={() =>
                    setAuthFormData({
                      ...authFormData,
                      email: "",
                    })
                  }
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-white hover:bg-zinc-600 rounded-full p-1 transition-all duration-200"
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
              )}
            </div>
          </div>
          {(authMode === "register" || authMode === "login") && (
            <>
              {emailChecking && (
                <div className="text-blue-400 text-sm mt-1">
                  {t('ui.components.authForm.validation.checking')}
                </div>
              )}

              {/* 注册模式下显示邮箱状态反馈 */}
              {authMode === "register" &&
                emailCheckResult &&
                !emailChecking &&
                authFormData.email && (
                  <div
                    className={`text-sm mt-2 flex items-center ${
                      emailCheckResult.status === "registered_unverified"
                        ? "text-yellow-400"
                        : emailCheckResult.status === "registered_verified"
                          ? "text-green-400"
                          : emailCheckResult.status === "not_registered"
                            ? "text-green-400"
                            : "text-gray-400"
                    }`}
                  >
                    {emailCheckResult.status === "registered_unverified" && (
                      <>
                        <svg
                          className="w-4 h-4 mr-2 flex-shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z"
                          />
                        </svg>
                        <span>{t('ui.components.authForm.validation.emailRegisteredUnverified')}</span>
                      </>
                    )}
                    {emailCheckResult.status === "registered_verified" && (
                      <>
                        <svg
                          className="w-4 h-4 mr-2 flex-shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                          />
                        </svg>
                        <span>{t('ui.components.authForm.validation.emailRegisteredVerified')}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setAuthMode("login");
                            setShowVerifiedModal(false);
                            setShowUnverifiedModal(false);
                          }}
                          className="ml-2 text-xs bg-green-600/20 hover:bg-green-600/30 px-2 py-1 rounded border border-green-600/50"
                        >
                          {t('ui.components.authForm.actions.goToLogin')}
                        </button>
                      </>
                    )}
                    {emailCheckResult.status === "not_registered" && (
                      <>
                        <svg
                          className="w-4 h-4 mr-2 flex-shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span>{t('ui.components.authForm.validation.emailAvailable')}</span>
                      </>
                    )}
                  </div>
                )}

              {/* 登录模式下只显示未注册的提示，其他状态会弹窗 */}
              {authMode === "login" &&
                emailCheckResult &&
                !emailChecking &&
                authFormData.email &&
                emailCheckResult.status === "not_registered" && (
                  <div className="text-sm mt-2 flex items-center text-gray-400">
                    <svg
                      className="w-4 h-4 mr-2 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>{t('ui.components.authForm.validation.emailNotRegistered')}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode("register");
                        setShowVerifiedModal(false);
                        setShowUnverifiedModal(false);
                      }}
                      className="ml-2 text-xs bg-blue-600/20 hover:bg-blue-600/30 px-2 py-1 rounded border border-blue-600/50"
                    >
                      {t('ui.components.authForm.actions.goToRegister')}
                    </button>
                  </div>
                )}

              <div className="mt-1 text-xs text-zinc-500">
                {t('ui.components.authForm.fields.email.privateNote')}
              </div>
            </>
          )}
        </div>

        {/* 密码字段 */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            {t('ui.components.authForm.fields.password.label')} <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-zinc-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={authFormData.password}
                onChange={(e) =>
                  setAuthFormData({
                    ...authFormData,
                    password: e.target.value,
                  })
                }
                className="w-full bg-zinc-700/50 border border-zinc-600 rounded-lg pl-10 pr-12 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder={t('ui.components.authForm.fields.password.placeholder')}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-white hover:bg-zinc-600 rounded-full p-1 transition-all duration-200"
              >
                {showPassword ? (
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
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29-3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0H3m0 0l7.532-7.532M21 12a9.97 9.97 0 01-1.563 3.029M3 3l7.532 7.532"
                    />
                  </svg>
                ) : (
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
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* 确认密码字段（仅注册模式） */}
        {authMode === "register" && (
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              {t('ui.components.authForm.fields.confirmPassword.label')} <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-zinc-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={authFormData.confirmPassword}
                  onChange={(e) =>
                    setAuthFormData({
                      ...authFormData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="w-full bg-zinc-700/50 border border-zinc-600 rounded-lg pl-10 pr-12 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                  placeholder={t('ui.components.authForm.fields.confirmPassword.placeholder')}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-white hover:bg-zinc-600 rounded-full p-1 transition-all duration-200"
                >
                  {showConfirmPassword ? (
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
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29-3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0H3m0 0l7.532-7.532M21 12a9.97 9.97 0 01-1.563 3.029M3 3l7.532 7.532"
                      />
                    </svg>
                  ) : (
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
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 错误信息 */}
        {error && (
          <div className="bg-red-900/20 border border-red-800/50 rounded-lg p-4 text-red-400 text-sm">
            <div className="flex items-center gap-3">
              <svg
                className="w-5 h-5 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* 提交按钮 */}
        <button
          onClick={handleAuth}
          disabled={
            authFormLoading ||
            !authFormData.email ||
            !authFormData.password ||
            (authMode === "register" &&
              (!authFormData.username || !authFormData.confirmPassword))
          }
          className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
            authMode === "login"
              ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
              : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
          }`}
        >
          {authFormLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              {authMode === "login" ? t('ui.components.authForm.actions.loggingIn') : t('ui.components.authForm.actions.registering')}
            </>
          ) : (
            <>
              {authMode === "login" ? (
                <>
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
                      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                    />
                  </svg>
                  {t('ui.components.authForm.actions.login')}
                </>
              ) : (
                <>
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
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                    />
                  </svg>
                  {t('ui.components.authForm.actions.register')}
                </>
              )}
            </>
          )}
        </button>
      </div>

      <div className="mt-6 pt-6 border-t border-zinc-700">
        <div className="text-center">
          <p className="text-xs text-zinc-500">
            {authMode === "login" ? (
              <>
                {t('ui.components.authForm.actions.noAccount')}{" "}
                <button
                  onClick={handleModeSwitch}
                  className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                >
                  {t('ui.components.authForm.actions.registerNow')}
                </button>
              </>
            ) : (
              <>
                {t('ui.components.authForm.actions.hasAccount')}{" "}
                <button
                  onClick={handleModeSwitch}
                  className="text-green-400 hover:text-green-300 font-medium transition-colors"
                >
                  {t('ui.components.authForm.actions.backToLogin')}
                </button>
              </>
            )}
          </p>
        </div>
      </div>

      {/* 邮箱状态模态框 */}
      <UnverifiedEmailModal
        isOpen={showUnverifiedModal}
        onClose={() => {
          setShowUnverifiedModal(false);
          setShowRegistrationSuccessBanner(false);
          // 用户关闭弹窗时 resolve Promise，继续执行 onSuccess
          emailVerificationPromise?.resolve();
        }}
        email={registeredEmail}
        onResendEmail={handleResendConfirmation}
        resendLoading={resendConfirmationLoading}
        showSuccessBanner={showRegistrationSuccessBanner}
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

