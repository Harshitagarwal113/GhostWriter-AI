import React from 'react';
import { AlertTriangle, RefreshCw, X } from 'lucide-react';
import type { ApiError } from '../types/story';

interface ConnectionBannerProps {
  error: ApiError | null;
  onRetry: () => void;
  onDismiss: () => void;
  retrying?: boolean;
}

export const ConnectionBanner: React.FC<ConnectionBannerProps> = ({
  error,
  onRetry,
  onDismiss,
  retrying,
}) => {
  if (!error) return null;

  return (
    <div
      role="alert"
      className="w-full bg-blood-950/90 border-y border-blood-800 text-blood-200 px-4 py-3 shadow-blood-glow transition-all animate-inkBleed"
    >
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-sans">
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="w-7 h-7 rounded-full bg-blood-900 border border-blood-700 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4 text-blood-300" />
          </div>
          <div className="text-left">
            <span className="font-semibold block text-blood-100">
              {error.isNetworkError ? 'Backend Connection Failed' : 'Story Generation Error'}
            </span>
            <span className="text-blood-300/90 leading-tight block">
              {error.message}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
          <button
            onClick={onRetry}
            disabled={retrying}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-blood-900 hover:bg-blood-800 border border-blood-700 text-blood-100 text-xs font-medium transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${retrying ? 'animate-spin' : ''}`} />
            <span>{retrying ? 'Retrying...' : 'Retry'}</span>
          </button>
          <button
            onClick={onDismiss}
            className="p-1.5 text-blood-400 hover:text-white rounded hover:bg-blood-900/50 transition-colors cursor-pointer"
            aria-label="Dismiss error notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
