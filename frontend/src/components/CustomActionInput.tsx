import React, { useState } from 'react';
import { PenTool, CornerDownLeft, Sparkles } from 'lucide-react';

interface CustomActionInputProps {
  onSubmit: (actionText: string) => void;
  disabled?: boolean;
}

export const CustomActionInput: React.FC<CustomActionInputProps> = ({
  onSubmit,
  disabled = false,
}) => {
  const [actionText, setActionText] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionText.trim() || disabled) return;
    onSubmit(actionText.trim());
    setActionText('');
  };

  return (
    <div className="mt-5 pt-4 border-t border-horror-800/80">
      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="flex items-center justify-between text-xs font-sans text-horror-400">
          <label htmlFor="custom-action-input" className="flex items-center space-x-1.5 uppercase tracking-wider font-medium">
            <PenTool className="w-3.5 h-3.5 text-blood-400" />
            <span>Or carve your own fate...</span>
          </label>
          <span className="text-[11px] text-horror-400 flex items-center space-x-1">
            <Sparkles className="w-3 h-3 text-horror-400" />
            <span>Gemma adapts to your words</span>
          </span>
        </div>

        <div
          className={`flex items-center rounded-md border bg-horror-950/90 transition-all ${
            isFocused
              ? 'border-blood-600 shadow-blood-glow'
              : 'border-horror-800 hover:border-horror-700'
          }`}
        >
          <input
            id="custom-action-input"
            type="text"
            value={actionText}
            onChange={(e) => setActionText(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={disabled}
            placeholder="Type your own action (e.g., 'Whisper the name etched on the silver key...')"
            maxLength={180}
            className="w-full bg-transparent px-3.5 py-3 text-sm text-horror-100 placeholder:text-horror-400/70 font-sans focus:outline-none disabled:opacity-50"
          />

          <button
            type="submit"
            disabled={disabled || !actionText.trim()}
            className="mr-2 px-3.5 py-2 rounded bg-blood-950 hover:bg-blood-900 border border-blood-800 text-blood-200 text-xs font-sans font-medium flex items-center space-x-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
            aria-label="Submit custom action"
          >
            <span>Act</span>
            <CornerDownLeft className="w-3 h-3" />
          </button>
        </div>

        <div className="flex justify-between items-center text-[11px] text-horror-400 px-1 font-sans">
          <span>Be specific. Every unprompted action carries unknown risks.</span>
          <span>{actionText.length}/180</span>
        </div>
      </form>
    </div>
  );
};
