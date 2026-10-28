import React from 'react';
import { Skull, Compass, BookOpen, Brain, ArrowRight, ShieldCheck, Cpu } from 'lucide-react';

interface LandingPageProps {
  onStartSetup: () => void;
  onOpenSettings: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartSetup,
  onOpenSettings,
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] text-center px-4 py-12 max-w-4xl mx-auto space-y-12 animate-inkBleed">
      {/* Brand Hero */}
      <div className="space-y-6">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full border border-blood-800/80 bg-blood-950/40 text-blood-300 text-xs font-sans tracking-widest uppercase shadow-sm">
          <Skull className="w-3.5 h-3.5 text-blood-400" />
          <span>Interactive Horror Chronicle</span>
        </div>

        <div className="space-y-3">
          <h1 className="font-cinzel text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-horror-100 uppercase">
            Ghostwriter <span className="text-blood-500 font-black">AI</span>
          </h1>
          <p className="font-serif italic text-xl sm:text-2xl md:text-3xl text-blood-400 font-normal tracking-wide">
            "Every Choice Leaves a Scar."
          </p>
        </div>

        <p className="font-sans text-sm sm:text-base text-horror-300 max-w-2xl mx-auto leading-relaxed">
          Step into an interactive gothic horror generator where there are no pre-scripted rails.
          Every corridor you walk down, every relic you disturb, and every word you whisper is
          remembered by the intelligence lingering within the walls.
        </p>

        {/* Primary Call to Action */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onStartSetup}
            className="w-full sm:w-auto px-8 py-4 rounded-md bg-blood-900 hover:bg-blood-800 border border-blood-600 text-white font-cinzel font-bold text-base tracking-widest uppercase transition-all duration-300 shadow-blood-glow hover:shadow-blood-glow-lg flex items-center justify-center space-x-3 cursor-pointer group active:scale-[0.98]"
            aria-label="Enter the Unknown and begin story setup"
          >
            <span>Enter the Unknown</span>
            <ArrowRight className="w-5 h-5 text-blood-300 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Atmospheric Feature Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full text-left font-sans">
        <div className="p-5 rounded-lg border border-horror-800 bg-horror-900/60 hover:border-horror-700 transition-all space-y-2.5">
          <div className="w-8 h-8 rounded border border-horror-700 bg-horror-950 flex items-center justify-center text-blood-400">
            <Brain className="w-4 h-4" />
          </div>
          <h2 className="font-cinzel text-sm font-semibold text-horror-100 tracking-wide">
            Persistent Memory
          </h2>
          <p className="text-xs text-horror-400 leading-relaxed">
            The narrative engine retains clues, psychological wounds, and fateful decisions across chapters. Your past will confront you.
          </p>
        </div>

        <div className="p-5 rounded-lg border border-horror-800 bg-horror-900/60 hover:border-horror-700 transition-all space-y-2.5">
          <div className="w-8 h-8 rounded border border-horror-700 bg-horror-950 flex items-center justify-center text-blood-400">
            <Compass className="w-4 h-4" />
          </div>
          <h2 className="font-cinzel text-sm font-semibold text-horror-100 tracking-wide">
            Unscripted Agency
          </h2>
          <p className="text-xs text-horror-400 leading-relaxed">
            Select from dynamic story paths or carve your own custom actions. Gemma weaves continuous emergent horror around your exact words.
          </p>
        </div>

        <div className="p-5 rounded-lg border border-horror-800 bg-horror-900/60 hover:border-horror-700 transition-all space-y-2.5">
          <div className="w-8 h-8 rounded border border-horror-700 bg-horror-950 flex items-center justify-center text-blood-400">
            <BookOpen className="w-4 h-4" />
          </div>
          <h2 className="font-cinzel text-sm font-semibold text-horror-100 tracking-wide">
            Branching Endings
          </h2>
          <p className="text-xs text-horror-400 leading-relaxed">
            Survive, succumb to madness, or uncover hidden revelations. Each conclusion produces a full autopsy of your decisions.
          </p>
        </div>
      </div>

      {/* Technology Attribution & Privacy Note */}
      <div className="w-full pt-4 border-t border-horror-800/60 flex flex-col sm:flex-row items-center justify-between text-xs text-horror-400 font-sans gap-3">
        <div className="flex items-center space-x-2 text-left">
          <Cpu className="w-4 h-4 text-blood-400 shrink-0" />
          <span>
            Uses <strong className="text-horror-200">Google Gemma open-weight model</strong> via the Gemini API.
          </span>
        </div>
        <div className="flex items-center space-x-2 text-right">
          <ShieldCheck className="w-4 h-4 text-horror-400 shrink-0" />
          <button
            onClick={onOpenSettings}
            className="hover:text-horror-200 underline underline-offset-2 transition-colors cursor-pointer"
          >
            Processed by configured remote AI service • Inspect settings
          </button>
        </div>
      </div>
    </div>
  );
};
