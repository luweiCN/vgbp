import React from 'react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  roomName?: string;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  roomName,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-90 flex items-center justify-center p-4">
      <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-6 max-w-md w-full mx-auto shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-white">删除房间</h3>
            <p className="text-sm text-zinc-400 mt-1">
              此操作不可恢复，请谨慎操作
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white text-2xl transition-colors p-1 hover:bg-zinc-700 rounded-lg"
          >
            ×
          </button>
        </div>

        <div className="mb-6 p-4 bg-red-900/20 border border-red-800 rounded-lg">
          <div className="flex items-center gap-3">
            <svg
              className="w-6 h-6 text-red-400 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <div>
              <p className="text-red-400 font-medium">
                确定要删除这个房间吗？
              </p>
              <p className="text-red-300 text-sm mt-1">
                删除后将无法恢复，所有相关数据都会被清除
              </p>
              {roomName && (
                <p className="text-red-200 text-xs mt-2">
                  房间名称：{roomName}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-red-500/20 flex items-center justify-center gap-2"
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
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            确认删除
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  );
};