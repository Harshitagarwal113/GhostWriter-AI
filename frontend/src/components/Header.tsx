import React from 'react';
import { Skull, Settings, Activity, Wifi, WifiOff } from 'lucide-react';
import type { ApiHealthResponse } from '../types/story';

interface HeaderProps {
  onOpenSettings: () => void;
  onHomeClick?: () => void;
  isInStory?: boolean;
  health: ApiHealthResponse | null;
  healthLoading: boolean;
  healthError: string | null;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSettings,
  onHomeClick,
  isInStory,
  health,
  healthLoading,
  healthError,
}) => {
  const isHealthy = !!health && !healthError;

  return (
    <header className="w-full border-b border-horror-800/80 bg-horror-950/80 backdrop-blur-sm sticky top-0 z-40 transition-colors">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo / Branding */}
        <div
          onClick={onHomeClick}
          className={`flex items-center space-x-3 group ${
            onHomeClick ? 'cursor-pointer' : ''
          }`}
          role={onHomeClick ? 'button' : undefined}
          tabIndex={onHomeClick ? 0 : undefined}
          onKeyDown={(e) => {
            if (onHomeClick && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault();
              onHomeClick();
            }
          }}
          aria-label="Ghostwriter AI Home"
        >
          <div className="w-9 h-9 rounded border border-blood-800/60 bg-blood-950/50 flex items-center justify-center text-blood-400 group-hover:border-blood-600 transition-colors shadow-creepy-inner">
            <Skull className="w-5 h-5 text-blood-400 group-hover:text-blood-300 transition-colors" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-cinzel text-lg tracking-widest font-bold text-horror-100 group-hover:text-white transition-colors">
                GHOSTWRITER<span className="text-blood-500 font-black">.AI</span>
              </span>
              <span className="text-[10px] uppercase font-sans tracking-widest px-2 py-0.5 rounded border border-blood-900/60 bg-blood-950/40 text-blood-400 hidden sm:inline-block">
                Gemma Model
              </span>
            </div>
            <p className="text-[11px] text-horror-400 tracking-wider font-sans -mt-0.5 hidden md:block">
              Every Choice Leaves a Scar
            </p>
          </div>
        </div>

        {/* Right Actions: Health Status & Settings */}
        <div className="flex items-center space-x-3">
          {/* Health Pill */}
          <button
            onClick={onOpenSettings}
            className="flex items-center space-x-2 px-3 py-1.5 rounded border border-horror-800 bg-horror-900/90 text-xs font-sans text-horror-300 hover:border-horror-700 transition-all cursor-pointer"
            title={
              healthLoading
                ? 'Checking backend status...'
                : isHealthy
                ? `Backend Online (${health?.model || 'Gemma'})`
                : 'Backend Unreachable - Click to inspect'
            }
            aria-label="Backend status details"
          >
            {healthLoading ? (
              <Activity className="w-3.5 h-3.5 text-amber-400 animate-spin" />
            ) : isHealthy ? (
              <Wifi className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <WifiOff className="w-3.5 h-3.5 text-blood-500" />
            )}
            <span className="hidden sm:inline">
              {healthLoading
                ? 'Checking...'
                : isHealthy
                ? 'Backend Ready'
                : 'Offline'}
            </span>
          </button>

          {/* Settings Trigger */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded border border-horror-800 bg-horror-900/90 text-horror-300 hover:text-horror-100 hover:border-blood-800/80 transition-all cursor-pointer"
            title="System Architecture & Settings"
            aria-label="Open System Architecture & Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* If in story, option to return to setup/home */}
          {isInStory && onHomeClick && (
            <button
              onClick={onHomeClick}
              className="px-3 py-1.5 rounded border border-blood-900/80 bg-blood-950/30 text-xs font-sans text-blood-300 hover:bg-blood-950/60 hover:text-blood-200 transition-colors cursor-pointer"
              aria-label="Return home"
            >
              Exit Story
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
