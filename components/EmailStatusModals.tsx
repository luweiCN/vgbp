import React from 'react';
import { X, Check, AlertTriangle, CheckCircle, LogIn } from 'lucide-react';
import { useCountdown } from '@/hooks/useCountdown';
import { useI18n } from '@/i18n/hooks/useI18n';
import { Icon } from './ui/Icon';

interface BaseUnverifiedModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  onResendEmail: () => void;
  resendLoading?: boolean;
  initialCooldownSeconds?: number;
}

interface UnverifiedEmailModalProps extends BaseUnverifiedModalProps {
  showSuccessBanner?: boolean; // 是否显示成功横幅（用于注册成功场景）
}

interface VerifiedEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  onSwitchToLogin: () => void;
}

/**
 * 未验证邮箱弹窗组件
 * 支持显示成功横幅（注册成功场景）
 */
export const UnverifiedEmailModal: React.FC<UnverifiedEmailModalProps> = ({
  isOpen,
  onClose,
  email,
  onResendEmail,
  resendLoading = false,
  initialCooldownSeconds = 0,
  showSuccessBanner = false
}) => {
    const { t } = useI18n();
    const countdown = useCountdown({ initialTime: initialCooldownSeconds });

  const handleResendEmail = async () => {
    if (countdown.isActive || resendLoading) return;

    try {
      await onResendEmail();
      countdown.start(60); // 明确指定60秒倒计时
    } catch (error) {
      // Error handling is done in parent
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-[150] p-4">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white">{t('ui.components.emailModals.unverified.title')}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <Icon icon={X} preset="md" />
          </button>
        </div>

        <div className="space-y-4">
          {/* 注册成功横幅 */}
          {showSuccessBanner && (
            <div className="bg-linear-to-r from-green-600 to-emerald-600 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="shrink-0">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Icon icon={Check} preset="md" className="text-white" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white">{t('ui.components.emailModals.unverified.successBanner')}</h3>
                <p className="text-green-100 text-sm">{t('ui.components.emailModals.unverified.successMessage')}</p>
              </div>
            </div>
                  </div>
          )}

          <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
            <div className="flex items-start">
              <Icon icon={AlertTriangle} preset="sm" className="text-yellow-400 mt-0.5 mr-3 shrink-0" />
              <div>
                <p className="text-yellow-200 font-medium">{t('ui.components.emailModals.unverified.description')}</p>
                <p className="text-yellow-300 text-sm mt-1">
                  {t('ui.components.emailModals.unverified.emailSent', { email: <span className="font-mono bg-yellow-900/30 px-1 rounded">{email}</span> })}
                </p>
              </div>
            </div>
          </div>

          <div className="text-gray-300 text-sm">
            <p>{t('ui.components.emailModals.unverified.instructions.checkEmail')}</p>
            <p>{t('ui.components.emailModals.unverified.instructions.clickLink')}</p>
            <p>{t('ui.components.emailModals.unverified.instructions.waitVerification')}</p>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors text-sm"
            >
              {t('ui.components.emailModals.unverified.actions.gotIt')}
            </button>

            <button
              onClick={handleResendEmail}
              disabled={resendLoading || countdown.isActive}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
            >
              {resendLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {t('ui.components.emailModals.unverified.actions.sending')}
                </>
              ) : countdown.isActive ? (
                t('ui.components.emailModals.unverified.actions.resendWithCountdown', { countdown: countdown.timeLeft })
              ) : (
                t('ui.components.emailModals.unverified.actions.resend')
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * 已验证邮箱弹窗组件
 */
export const VerifiedEmailModal: React.FC<VerifiedEmailModalProps> = ({
  isOpen,
  onClose,
  email,
  onSwitchToLogin
}) => {
  const { t } = useI18n();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-[150] p-4">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white">{t('ui.components.emailModals.verified.title')}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <Icon icon={X} preset="md" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
            <div className="flex items-start">
              <Icon icon={CheckCircle} preset="sm" className="text-green-400 mt-0.5 mr-3 shrink-0" />
              <div>
                <p className="text-green-200 font-medium">{t('ui.components.emailModals.verified.status')}</p>
                <p className="text-green-300 text-sm mt-1">
                  {t('ui.components.emailModals.verified.description', { email: <span className="font-mono bg-green-900/30 px-1 rounded">{email}</span> })}
                </p>
              </div>
            </div>
          </div>

          <div className="text-gray-300 text-sm">
            <p>{t('ui.components.emailModals.verified.instructions.verified')}</p>
            <p>{t('ui.components.emailModals.verified.instructions.canLogin')}</p>
            <p>{t('ui.components.emailModals.verified.instructions.startUsing')}</p>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors text-sm"
            >
              {t('ui.components.emailModals.verified.actions.continueRegister')}
            </button>

            <button
              onClick={onSwitchToLogin}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
            >
              {t('ui.components.emailModals.verified.actions.loginNow')}
              <Icon icon={LogIn} preset="xs" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};