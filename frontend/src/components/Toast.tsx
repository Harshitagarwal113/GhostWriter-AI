import React, { useEffect } from 'react';
import { CheckCircle2, X } from 'lucide-react';

interface ToastProps {
  message: string | null;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  onClose,
  duration = 3500,
}) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-50 flex items-center space-x-2.5 px-4 py-3 rounded-md bg-horror-900 border border-blood-800 text-horror-100 shadow-blood-glow text-xs font-sans animate-inkBleed"
    >
      <CheckCircle2 className="w-4 h-4 text-blood-400 shrink-0" />
      <span>{message}</span>
      <button
        onClick={onClose}
        className="p-1 text-horror-400 hover:text-white transition-colors"
        aria-label="Dismiss toast"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
