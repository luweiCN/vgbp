import React from 'react';
import { EmailVerificationModal, EmailModalType } from './EmailVerificationModal';

interface UnverifiedEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  onResendEmail: () => void;
  resendLoading?: boolean;
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
 * @deprecated 请使用统一的 EmailVerificationModal 组件
 * 适配器组件，为了保持向后兼容性
 */
export const UnverifiedEmailModal: React.FC<UnverifiedEmailModalProps> = (props) => {
  return (
    <EmailVerificationModal
      {...props}
      type="unverified-email"
      onResendEmail={props.onResendEmail}
      initialCooldownSeconds={props.initialCooldownSeconds}
    />
  );
};

/**
 * @deprecated 请使用统一的 EmailVerificationModal 组件
 * 适配器组件，为了保持向后兼容性
 */
export const VerifiedEmailModal: React.FC<VerifiedEmailModalProps> = (props) => {
  return (
    <EmailVerificationModal
      {...props}
      type="verified-email"
      onSwitchToLogin={props.onSwitchToLogin}
    />
  );
};