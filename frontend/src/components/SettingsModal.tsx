import React, { useEffect } from 'react';
import { X, RefreshCw, Cpu, Server, Shield, CheckCircle2, AlertTriangle } from 'lucide-react';
import { getApiBaseUrl } from '../services/api';
import type { ApiHealthResponse } from '../types/story';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  health: ApiHealthResponse | null;
  loading: boolean;
  error: string | null;
  onRecheck: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  health,
  loading,
  error,
  onRecheck,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const baseUrl = getApiBaseUrl();
  const isHealthy = !!health && !error;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-inkBleed"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
    >
      {/* Backdrop click */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-horror-900 border border-horror-800 rounded-lg p-6 shadow-2xl text-horror-100 z-10">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-horror-800 pb-4 mb-5">
          <div className="flex items-center space-x-2.5">
            <Cpu className="w-5 h-5 text-blood-500" />
            <h2 id="settings-title" className="font-cinzel text-lg tracking-wider font-semibold">
              System Architecture & Inference
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-horror-400 hover:text-white hover:bg-horror-800 transition-colors"
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 font-sans text-xs leading-relaxed text-horror-300">
          {/* AI Model Attribution Card */}
          <div className="p-3.5 rounded border border-horror-800/80 bg-horror-950/60 space-y-2">
            <div className="flex items-center space-x-2 text-horror-200 font-medium">
              <Cpu className="w-4 h-4 text-blood-400" />
              <span>Model Integration</span>
            </div>
            <p>
              Ghostwriter AI uses Google's <strong>Gemma open-weight model</strong> via the Google Gemini API.
              The backend maintains context memory and branching narratives across scenes without hallucinatory drift.
            </p>
            <div className="flex items-center space-x-2 text-[11px] text-horror-400 pt-1">
              <span className="px-2 py-0.5 rounded bg-horror-800 border border-horror-700 text-horror-200">
                Model: {health?.model || 'Gemma 2 / Gemini API'}
              </span>
              <span className="px-2 py-0.5 rounded bg-horror-800 border border-horror-700 text-horror-200">
                Status: {health?.model_configured ? 'Configured' : isHealthy ? 'Ready' : 'Pending Backend'}
              </span>
            </div>
          </div>

          {/* Backend Connection Card */}
          <div className="p-3.5 rounded border border-horror-800/80 bg-horror-950/60 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-horror-200 font-medium">
                <Server className="w-4 h-4 text-blood-400" />
                <span>Backend API Target</span>
              </div>
              <button
                onClick={onRecheck}
                disabled={loading}
                className="flex items-center space-x-1 px-2.5 py-1 rounded border border-horror-700 bg-horror-800 text-horror-200 hover:border-blood-700 hover:text-white transition-all disabled:opacity-50 cursor-pointer"
                aria-label="Recheck backend health"
              >
                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                <span>{loading ? 'Testing...' : 'Test Connection'}</span>
              </button>
            </div>
            <div className="font-mono text-[11px] text-horror-400 break-all bg-black/40 p-2 rounded border border-horror-850">
              {baseUrl}
            </div>

            {/* Health Result */}
            {isHealthy ? (
              <div className="flex items-center space-x-2 text-emerald-400 text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Backend reachable & ready to generate narratives.</span>
              </div>
            ) : (
              <div className="flex items-start space-x-2 text-blood-400 text-[11px]">
                <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <div>
                  <span className="font-semibold">Backend unreachable:</span>{' '}
                  {error || 'Connection refused. Ensure the backend server is running.'}
                </div>
              </div>
            )}
          </div>

          {/* Privacy & State Architecture */}
          <div className="p-3.5 rounded border border-horror-800/80 bg-horror-950/60 space-y-1.5">
            <div className="flex items-center space-x-2 text-horror-200 font-medium">
              <Shield className="w-4 h-4 text-horror-400" />
              <span>Data Privacy & Ephemeral State</span>
            </div>
            <p>
              Your active story session is preserved in your browser's local session memory. No cookies, no accounts, and no authentication required.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-3 border-t border-horror-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-horror-800 hover:bg-horror-700 text-white text-xs font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
