import React from 'react';
import { useI18n } from '../i18n/hooks/useI18n';

interface ClassificationInfoModalProps {
  onClose: () => void;
}

const ClassificationInfoModal: React.FC<ClassificationInfoModalProps> = ({
  onClose,
}) => {
  const { t } = useI18n();
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 max-w-md w-full mx-auto shadow-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">{t('ui.components.classificationInfoModal.title')}</h3>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4 text-zinc-300">
          <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <h4 className="font-semibold text-yellow-400">{t('ui.components.classificationInfoModal.official.title')}</h4>
            </div>
            <p className="text-sm leading-relaxed">
              {t('ui.components.classificationInfoModal.official.description')}
            </p>
          </div>

          <div className="p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <h4 className="font-semibold text-emerald-400">{t('ui.components.classificationInfoModal.common.title')}</h4>
            </div>
            <p className="text-sm leading-relaxed">
              {t('ui.components.classificationInfoModal.common.description')}
            </p>
          </div>

          <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/20">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <h4 className="font-semibold text-red-400">{t('ui.components.classificationInfoModal.flex.title')}</h4>
            </div>
            <p className="text-sm leading-relaxed">
              {t('ui.components.classificationInfoModal.flex.description')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassificationInfoModal;