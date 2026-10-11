import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, LogOut, Trash2, HelpCircle, Loader2, X } from 'lucide-react';

/**
 * Universal Confirmation Modal Component
 * Styled in Beige Limestone & Olive Green dark aesthetic
 * Rendered via createPortal directly into document.body to guarantee exact screen center positioning
 */
const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  loading = false,
}) => {
  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !loading) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, loading, onClose]);

  if (!isOpen) return null;

  // Icon & color styling by variant
  const getVariantStyles = () => {
    switch (variant) {
      case 'logout':
        return {
          icon: <LogOut className="h-6 w-6 text-amber-400" />,
          iconBg: 'bg-amber-500/10 border-amber-500/20',
          confirmBtn:
            'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30',
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="h-6 w-6 text-amber-400" />,
          iconBg: 'bg-amber-500/10 border-amber-500/20',
          confirmBtn:
            'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30',
        };
      case 'primary':
        return {
          icon: <HelpCircle className="h-6 w-6 text-brand-400" />,
          iconBg: 'bg-brand-500/10 border-brand-500/20',
          confirmBtn:
            'bg-brand-600 hover:bg-brand-500 text-white shadow-brand-600/30',
        };
      case 'danger':
      default:
        return {
          icon: <Trash2 className="h-6 w-6 text-rose-400" />,
          iconBg: 'bg-rose-500/10 border-rose-500/20',
          confirmBtn:
            'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30',
        };
    }
  };

  const { icon, iconBg, confirmBtn } = getVariantStyles();

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm transition-opacity"
      style={{ margin: 0, top: 0, left: 0, right: 0, bottom: 0 }}
      onClick={() => {
        if (!loading) onClose();
      }}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl border border-[#1E2E21] bg-[#101912] p-6 shadow-2xl transition-transform animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          disabled={loading}
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-limestone-400 hover:bg-[#1A281E] hover:text-white transition disabled:opacity-50"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start space-x-3.5 mb-4">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${iconBg} shadow-inner`}
          >
            {icon}
          </div>
          <div className="pt-0.5">
            <h3 className="text-sm font-bold text-white tracking-tight">{title}</h3>
            <p className="mt-1 text-xs text-limestone-400 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center justify-end space-x-2.5">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="rounded-xl border border-[#1E2E21] bg-[#142017] px-4 py-2.5 text-xs font-semibold text-limestone-300 hover:bg-[#1A281E] hover:text-white transition disabled:opacity-50"
          >
            {cancelText}
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className={`flex items-center space-x-1.5 rounded-xl px-4 py-2.5 text-xs font-bold shadow-md transition disabled:opacity-50 ${confirmBtn}`}
          >
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? createPortal(modalContent, document.body)
    : null;
};

export default ConfirmModal;
