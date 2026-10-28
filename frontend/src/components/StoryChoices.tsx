import React, { useEffect } from 'react';
import { ArrowRight, AlertCircle, Compass } from 'lucide-react';
import type { StoryChoice } from '../types/story';

interface StoryChoicesProps {
  choices: StoryChoice[];
  onSelectChoice: (choice: StoryChoice) => void;
  disabled?: boolean;
}

export const StoryChoices: React.FC<StoryChoicesProps> = ({
  choices,
  onSelectChoice,
  disabled = false,
}) => {
  // Keyboard shortcut listener for keys 1, 2, 3
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Do not trigger if player is typing inside an input or textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      if (disabled) return;

      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= choices.length) {
        e.preventDefault();
        onSelectChoice(choices[num - 1]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [choices, disabled, onSelectChoice]);

  if (!choices || choices.length === 0) {
    return (
      <div className="p-4 rounded border border-horror-800 bg-horror-900/40 text-center text-horror-400 font-sans text-xs">
        No immediate paths emerge from the gloom...
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs font-sans text-horror-400 uppercase tracking-widest px-1">
        <span className="flex items-center space-x-1.5">
          <Compass className="w-3.5 h-3.5 text-blood-500" />
          <span>Paths of Consequence</span>
        </span>
        <span className="text-[10px] text-horror-400 hidden sm:inline">
          Press [1], [2], or [3]
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2.5">
        {choices.map((choice, index) => {
          const numberKey = index + 1;
          const risk = choice.risk_level?.toLowerCase();

          return (
            <button
              key={choice.id || index}
              onClick={() => onSelectChoice(choice)}
              disabled={disabled}
              className="group relative w-full text-left p-4 rounded-md border border-horror-800 bg-horror-900/80 hover:bg-horror-850 hover:border-blood-700/80 active:border-blood-600 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-blood-glow focus-visible:ring-2 focus-visible:ring-blood-600"
              aria-label={`Choice ${numberKey}: ${choice.text}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start space-x-3.5 flex-1">
                  {/* Number badge */}
                  <span className="w-6 h-6 rounded border border-horror-700 bg-horror-950 flex items-center justify-center font-mono text-xs text-horror-300 font-bold shrink-0 mt-0.5 group-hover:border-blood-600 group-hover:text-blood-400 group-hover:bg-blood-950/40 transition-colors">
                    {numberKey}
                  </span>

                  {/* Choice text */}
                  <div className="space-y-1">
                    <p className="font-serif text-base sm:text-lg text-horror-100 group-hover:text-white leading-snug transition-colors">
                      {choice.text}
                    </p>

                    {/* Optional risk badge */}
                    {risk && (
                      <div className="flex items-center space-x-1 text-[11px] font-sans">
                        <AlertCircle className="w-3 h-3 text-blood-400" />
                        <span
                          className={`capitalize ${
                            risk === 'high' || risk === 'fatal'
                              ? 'text-blood-400 font-medium'
                              : 'text-horror-400'
                          }`}
                        >
                          {choice.risk_level} Risk
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Arrow indicator */}
                <div className="pt-1 shrink-0 text-horror-400 group-hover:text-blood-400 group-hover:translate-x-1 transition-all">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
