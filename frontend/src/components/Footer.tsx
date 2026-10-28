import React from 'react';
import { ShieldCheck, Cpu } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-horror-800/60 bg-horror-950/70 py-6 px-4 text-xs text-horror-400 font-sans transition-colors mt-auto">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Attribution */}
        <div className="flex items-center space-x-2 text-center md:text-left">
          <Cpu className="w-4 h-4 text-blood-500 shrink-0" />
          <span>
            Crafted for <strong className="text-horror-200">DEV.to Hacktoberfest 2026</strong> —{' '}
            <span className="italic text-horror-300">"Ghost in the Machine"</span>. Powered by{' '}
            <strong className="text-horror-200">Google's Gemma</strong> open-weight model via the Gemini API.
          </span>
        </div>

        {/* Privacy Note */}
        <div className="flex items-center space-x-2 text-horror-400 text-center md:text-right">
          <ShieldCheck className="w-4 h-4 text-horror-400 shrink-0" />
          <span>
            Privacy Notice: Story prompts and interactions are processed securely through the configured remote AI inference service. No authentication or personal data collected.
          </span>
        </div>
      </div>
    </footer>
  );
};
