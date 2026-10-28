import React from 'react';
import { Skull } from 'lucide-react';

interface LoadingAtmosphereProps {
  message: string;
  subtext?: string;
  compact?: boolean;
}

export const LoadingAtmosphere: React.FC<LoadingAtmosphereProps> = ({
  message,
  subtext = 'Gemma AI is weaving your consequences...',
  compact = false,
}) => {
  if (compact) {
    return (
      <div
        className="flex items-center space-x-3 py-3 px-4 rounded border border-blood-900/60 bg-horror-900/80 animate-pulse text-blood-300 font-sans text-xs"
        role="status"
        aria-live="polite"
      >
        <Skull className="w-4 h-4 text-blood-500 animate-bounce" />
        <span className="italic">{message}</span>
      </div>
    );
  }

  return (
    <div
      className="py-12 px-6 flex flex-col items-center justify-center text-center space-y-4 rounded-lg border border-horror-800 bg-horror-900/60 shadow-2xl relative overflow-hidden"
      role="status"
      aria-live="polite"
    >
      {/* Background ambient red pulse */}
      <div className="absolute inset-0 bg-gradient-to-b from-red-950/20 via-transparent to-black/40 pointer-events-none" />

      {/* Stylized creepy gothic sigil animation */}
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-2 border-blood-900/60 flex items-center justify-center bg-horror-950/90 shadow-blood-glow relative">
          <div className="absolute inset-0 rounded-full border-t-2 border-blood-500 animate-spin" />
          <Skull className="w-8 h-8 text-blood-400 animate-pulse" />
        </div>
      </div>

      <div className="space-y-1 relative z-10 max-w-md">
        <p className="font-cinzel text-base md:text-lg text-horror-100 tracking-wider font-semibold transition-all">
          "{message}"
        </p>
        <p className="font-sans text-xs text-horror-400 tracking-wide">
          {subtext}
        </p>
      </div>

      <div className="w-32 h-0.5 bg-gradient-to-r from-transparent via-blood-800 to-transparent animate-pulse" />
    </div>
  );
};
