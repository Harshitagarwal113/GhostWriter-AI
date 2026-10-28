import React, { useState } from 'react';
import {
  Skull,
  RotateCcw,
  Home,
  Copy,
  Check,
  Award,
  HelpCircle,
  KeyRound,
  History,
  Activity,
} from 'lucide-react';
import type { StorySession } from '../types/story';

interface EndingPageProps {
  session: StorySession;
  onPlayAgain: () => void;
  onReturnHome: () => void;
  onRateStory: (rating: number) => void;
  onCopyStory: () => Promise<boolean>;
}

export const EndingPage: React.FC<EndingPageProps> = ({
  session,
  onPlayAgain,
  onReturnHome,
  onRateStory,
  onCopyStory,
}) => {
  const [copied, setCopied] = useState(false);
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const ending = session.current_scene.ending;
  const endingTitle = ending?.title || 'The Final Silence';
  const endingType = ending?.ending_type || 'Survivor';
  const finalNarrative = ending?.final_narrative || session.current_scene.narrative;
  const summary = ending?.summary || 'The story concludes, but the marks it left upon you remain indelible.';
  const unresolved = ending?.unresolved_mysteries || [];
  const clues = session.current_scene.memory?.clues || [];
  const scars = session.current_scene.memory?.scars_or_state || [];
  const currentRating = session.rating || 0;

  const handleCopy = async () => {
    const success = await onCopyStory();
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8 font-sans animate-inkBleed">
      {/* Ending Header Card */}
      <div className="text-center space-y-4 py-8 px-6 rounded-lg border border-blood-900/80 bg-horror-900/80 shadow-blood-glow relative overflow-hidden">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full border border-blood-700 bg-blood-950/80 text-blood-300 text-xs uppercase tracking-widest font-semibold">
          <Award className="w-3.5 h-3.5 text-blood-400" />
          <span>Fate Concluded • {endingType}</span>
        </div>

        <div className="space-y-2">
          <h1 className="font-cinzel text-3xl sm:text-5xl font-black text-horror-100 uppercase tracking-tight">
            {endingTitle}
          </h1>
          <p className="font-serif italic text-base sm:text-xl text-blood-400">
            {session.title}
          </p>
        </div>

        <p className="font-sans text-xs sm:text-sm text-horror-300 max-w-2xl mx-auto leading-relaxed">
          {summary}
        </p>
      </div>

      {/* Final Narrative Passage */}
      <div className="p-6 sm:p-8 rounded-lg border border-horror-800 bg-horror-900/60 shadow-xl space-y-4">
        <div className="flex items-center space-x-2 text-xs text-blood-400 uppercase tracking-widest font-semibold border-b border-horror-800/70 pb-2">
          <Skull className="w-3.5 h-3.5" />
          <span>The Final Passage</span>
        </div>
        <div className="prose prose-invert max-w-none font-serif text-lg leading-relaxed text-horror-100 italic">
          <p>{finalNarrative}</p>
        </div>
      </div>

      {/* Choices Autopsy & Unresolved Mysteries */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Choices Recap */}
        <div className="p-5 rounded-lg border border-horror-800 bg-horror-900/60 space-y-3">
          <div className="flex items-center space-x-2 text-horror-200 font-semibold text-xs border-b border-horror-800 pb-2 uppercase tracking-wider">
            <History className="w-4 h-4 text-blood-400" />
            <span>Pathways Chosen ({session.history.length})</span>
          </div>
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1 text-xs">
            {session.history.map((h, i) => (
              <div key={i} className="p-2 rounded bg-horror-950/60 border border-horror-850">
                <span className="text-[10px] text-blood-400 uppercase font-mono block">
                  Scene {h.scene_number || i + 1}
                </span>
                <span className="text-horror-200 font-serif">
                  {h.chosen_text || h.custom_action || 'Crossed the threshold into the dark'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Mysteries & Clues */}
        <div className="p-5 rounded-lg border border-horror-800 bg-horror-900/60 space-y-4">
          <div className="flex items-center space-x-2 text-horror-200 font-semibold text-xs border-b border-horror-800 pb-2 uppercase tracking-wider">
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span>Unresolved Mysteries & Echoes</span>
          </div>

          <div className="space-y-3 text-xs">
            {unresolved.length > 0 ? (
              <div className="space-y-1.5">
                <span className="text-[10px] text-horror-400 uppercase font-semibold block">
                  Lingering Questions:
                </span>
                <ul className="space-y-1">
                  {unresolved.map((m, idx) => (
                    <li key={idx} className="flex items-start space-x-2 text-horror-300">
                      <span className="text-amber-500 font-bold">?</span>
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-horror-400 italic">All immediate mysteries collapsed with your final breath.</p>
            )}

            {/* Collected clues */}
            <div className="pt-2 border-t border-horror-800/60 space-y-1.5">
              <span className="text-[10px] text-horror-400 uppercase font-semibold flex items-center space-x-1">
                <KeyRound className="w-3 h-3 text-amber-400" />
                <span>Recovered Clues ({clues.length})</span>
              </span>
              {clues.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {clues.map((c, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-horror-950 border border-horror-800 text-[11px] text-horror-300"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-horror-400 italic">No clues collected.</span>
              )}
            </div>

            {/* Scars */}
            {scars.length > 0 && (
              <div className="pt-2 border-t border-horror-800/60 space-y-1.5">
                <span className="text-[10px] text-blood-400 uppercase font-semibold flex items-center space-x-1">
                  <Activity className="w-3 h-3 text-blood-500" />
                  <span>Permanent Scars</span>
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {scars.map((s, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-blood-950/60 border border-blood-900/60 text-[11px] text-blood-300"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Optional Rating Control (No Auth Required) */}
      <div className="p-4 rounded-lg border border-horror-800 bg-horror-900/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-horror-300">
        <div className="space-y-0.5 text-center sm:text-left">
          <span className="font-semibold text-horror-100 block">
            Rate this Generated Chronicle
          </span>
          <span className="text-horror-400 text-[11px]">
            {currentRating > 0
              ? `You rated this story ${currentRating} of 5 skulls.`
              : 'How potent was the horror generated by Gemma?'}
          </span>
        </div>

        <div className="flex items-center space-x-1.5" role="radiogroup" aria-label="Story Rating">
          {[1, 2, 3, 4, 5].map((star) => {
            const isFilled = (hoverRating ?? currentRating) >= star;
            return (
              <button
                key={star}
                type="button"
                onClick={() => onRateStory(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(null)}
                className="p-1 text-horror-400 hover:scale-110 transition-transform cursor-pointer"
                aria-label={`Rate ${star} skulls out of 5`}
              >
                <Skull
                  className={`w-5 h-5 transition-colors ${
                    isFilled ? 'text-blood-500 fill-blood-950' : 'text-horror-700'
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-horror-800">
        <button
          onClick={handleCopy}
          className="w-full sm:w-auto px-5 py-2.5 rounded border border-horror-700 bg-horror-900 hover:bg-horror-800 text-horror-200 text-xs font-sans font-medium flex items-center justify-center space-x-2 transition-colors cursor-pointer"
          aria-label="Copy story narrative to clipboard"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400">Story Copied to Clipboard</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-horror-400" />
              <span>Copy Complete Story</span>
            </>
          )}
        </button>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <button
            onClick={onReturnHome}
            className="flex-1 sm:flex-initial px-4 py-2.5 rounded border border-horror-800 bg-horror-950 hover:bg-horror-900 text-horror-300 hover:text-horror-100 text-xs font-sans flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </button>

          <button
            onClick={onPlayAgain}
            className="flex-1 sm:flex-initial px-6 py-2.5 rounded bg-blood-900 hover:bg-blood-800 border border-blood-600 text-white font-cinzel font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all shadow-blood-glow cursor-pointer active:scale-95"
          >
            <RotateCcw className="w-4 h-4 text-blood-300" />
            <span>Play Again</span>
          </button>
        </div>
      </div>
    </div>
  );
};
