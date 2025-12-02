import React from 'react';

interface ResetConfirmModalProps {
  selectedCount: number;
  onClose: () => void;
  onConfirm: () => void;
}

const ResetConfirmModal: React.FC<ResetConfirmModalProps> = ({
  selectedCount,
  onClose,
  onConfirm,
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 max-w-sm w-full mx-auto shadow-2xl">
        <h3 className="text-lg font-bold text-white mb-2">确认重置BP</h3>
        <p className="text-zinc-400 mb-6">
          确定要清空已选择的 {selectedCount} 个英雄吗？此操作不可撤销。
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
          >
            确认重置
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetConfirmModal;