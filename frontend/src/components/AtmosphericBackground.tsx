import React from 'react';
import type { SettingChoice } from '../types/story';

interface AtmosphericBackgroundProps {
  setting?: SettingChoice;
}

export const AtmosphericBackground: React.FC<AtmosphericBackgroundProps> = ({ setting }) => {
  // Subtly tint background gradients based on the setting chosen
  let tintGradient = 'from-red-950/15 via-transparent to-black';
  if (setting === 'Abandoned Hospital') {
    tintGradient = 'from-cyan-950/15 via-zinc-950/30 to-black';
  } else if (setting === 'Cursed Village') {
    tintGradient = 'from-amber-950/15 via-neutral-950/40 to-black';
  } else if (setting === 'Forgotten Asylum') {
    tintGradient = 'from-purple-950/15 via-neutral-950/40 to-black';
  } else if (setting === 'Dark Forest') {
    tintGradient = 'from-emerald-950/20 via-neutral-950/40 to-black';
  }

  return (
    <div
      className="fixed inset-0 pointer-events-none -z-10 overflow-hidden bg-[#0a0a0c]"
      aria-hidden="true"
    >
      {/* Dynamic Setting Ambient Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-b ${tintGradient} transition-colors duration-1000`} />

      {/* Atmospheric Fog Layers (subtle, slow, non-flashy) */}
      <div className="absolute -top-40 -left-40 w-[140%] h-[140%] opacity-25 filter blur-3xl animate-fog">
        <div className="w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-900/20 via-zinc-900/10 to-transparent" />
      </div>

      <div className="absolute -bottom-20 -right-20 w-[120%] h-[120%] opacity-20 filter blur-2xl animate-pulseSlow">
        <div className="w-full h-full bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-neutral-800/30 via-red-950/15 to-transparent" />
      </div>

      {/* Subtle Gothic Silhouette Tree / Window Overlay at bottom */}
      <svg
        className="absolute bottom-0 left-0 w-full h-48 md:h-64 text-[#060608] opacity-60"
        preserveAspectRatio="none"
        viewBox="0 0 1200 300"
        fill="currentColor"
      >
        <path d="M0,300 L0,220 C120,240 240,210 360,250 C480,220 600,260 720,230 C840,250 960,220 1080,240 C1140,230 1180,245 1200,250 L1200,300 Z" />
        <path
          d="M70,300 L95,140 L115,300 M240,300 L255,100 L275,300 M430,300 L450,160 L465,300 M680,300 L710,120 L735,300 M900,300 L920,150 L945,300 M1100,300 L1120,95 L1140,300"
          stroke="currentColor"
          strokeWidth="3"
          opacity="0.4"
        />
      </svg>

      {/* Noise Texture */}
      <div className="absolute inset-0 film-grain" />

      {/* Heavy Vignette */}
      <div className="absolute inset-0 vignette" />
    </div>
  );
};
