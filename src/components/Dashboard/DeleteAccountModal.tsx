import React from 'react';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}

const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  loading,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-md bg-white dark:bg-[#111] rounded-2xl shadow-lg transform transition-all duration-300 animate-fadeIn">
        <div className="p-6 sm:p-7">
          {/* Header */}
          <div className="flex items-center mb-5">
            <div className="flex-shrink-0 w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-red-600 dark:text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01M5 19h14a2 2 0 001.732-2.732L13.732 4.268a2 2 0 00-3.464 0L3.268 16.268A2 2 0 005 19z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                Delete Account
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                This action is permanent and cannot be undone.
              </p>
            </div>
          </div>

          {/* Warning Details */}
          <div className="mb-6">
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
              Are you sure you want to permanently delete your account? This will:
            </p>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 ml-5 list-disc">
              <li>Remove your profile and all personal data</li>
              <li>Delete all saved jobs and preferences</li>
              <li>Clear your job applications</li>
              <li>Sign you out immediately</li>
            </ul>
            <div className="mt-4 text-sm text-red-600 dark:text-red-400 font-medium">
              ⚠️ <strong>Warning:</strong> This action cannot be undone.
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-end gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 text-sm font-medium border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>

            <button
              onClick={onConfirm}
              disabled={loading}
              className="px-5 py-2.5 text-sm font-medium bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-[#111] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              )}
              {loading ? 'Deleting...' : 'Permanently Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteAccountModal;
