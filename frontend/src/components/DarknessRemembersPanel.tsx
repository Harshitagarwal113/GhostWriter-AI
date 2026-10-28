import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  KeyRound,
  History,
  Activity,
  User,
  MapPin,
  Eye,
} from 'lucide-react';
import type { StoryMemory, StorySetup } from '../types/story';

interface DarknessRemembersPanelProps {
  memory?: StoryMemory;
  setup?: StorySetup;
  sceneNumber: number;
}

export const DarknessRemembersPanel: React.FC<DarknessRemembersPanelProps> = ({
  memory,
  setup,
  sceneNumber,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const clues = memory?.clues || [];
  const scars = memory?.scars_or_state || [];
  const decisions = memory?.decisions || [];
  const protagonist = memory?.protagonist || setup?.protagonist_name || 'The Wanderer';
  const setting = memory?.setting || setup?.setting || 'Unknown Realm';

  const totalBadges = clues.length + scars.length + decisions.length;

  return (
    <div className="w-full rounded-lg border border-horror-800 bg-horror-900/90 shadow-lg overflow-hidden transition-all duration-300">
      {/* Accordion Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between text-left bg-horror-950/60 hover:bg-horror-850/80 transition-colors cursor-pointer border-b border-transparent data-[open=true]:border-horror-800"
        data-open={isOpen}
        aria-expanded={isOpen}
        aria-controls="darkness-panel-content"
      >
        <div className="flex items-center space-x-2.5">
          <Eye className="w-4 h-4 text-blood-400" />
          <span className="font-cinzel text-sm font-semibold tracking-wider text-horror-200">
            What The Darkness Remembers
          </span>
          {totalBadges > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-sans font-bold bg-blood-950 text-blood-300 border border-blood-800/60">
              {totalBadges} {totalBadges === 1 ? 'trace' : 'traces'}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2 text-xs text-horror-400 font-sans">
          <span className="hidden sm:inline">
            {isOpen ? 'Conceal Ledger' : 'Inspect Ledger'}
          </span>
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-horror-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-horror-400" />
          )}
        </div>
      </button>

      {/* Accordion Body */}
      {isOpen && (
        <div id="darkness-panel-content" className="p-4 space-y-4 font-sans text-xs animate-inkBleed">
          {/* Identity & Lore Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-2.5 rounded bg-horror-950 border border-horror-850 text-horror-300">
            <div className="flex items-center space-x-2">
              <User className="w-3.5 h-3.5 text-horror-400" />
              <div>
                <span className="text-[10px] text-horror-400 block uppercase tracking-wider">Soul</span>
                <span className="font-medium text-horror-100">{protagonist}</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="w-3.5 h-3.5 text-blood-400" />
              <div>
                <span className="text-[10px] text-horror-400 block uppercase tracking-wider">Domain</span>
                <span className="font-medium text-horror-100">{setting}</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Activity className="w-3.5 h-3.5 text-horror-400" />
              <div>
                <span className="text-[10px] text-horror-400 block uppercase tracking-wider">Pacing</span>
                <span className="font-medium text-horror-100">Scene {sceneNumber} ({setup?.horror_level || 'Psychological'})</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Clues Discovered */}
            <div className="p-3 rounded border border-horror-800/80 bg-horror-950/70 space-y-2">
              <div className="flex items-center space-x-1.5 text-horror-200 font-semibold border-b border-horror-800/50 pb-1.5">
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                <span className="tracking-wide">Discovered Clues ({clues.length})</span>
              </div>
              {clues.length === 0 ? (
                <p className="text-horror-400 italic">No artifacts or revelations uncovered yet.</p>
              ) : (
                <ul className="space-y-1.5">
                  {clues.map((clue, idx) => (
                    <li key={idx} className="flex items-start space-x-1.5 text-horror-300">
                      <span className="text-amber-500 font-bold">•</span>
                      <span>{clue}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Scars & State */}
            <div className="p-3 rounded border border-horror-800/80 bg-horror-950/70 space-y-2">
              <div className="flex items-center space-x-1.5 text-blood-300 font-semibold border-b border-horror-800/50 pb-1.5">
                <Activity className="w-3.5 h-3.5 text-blood-500" />
                <span className="tracking-wide">Scars & Mental State ({scars.length})</span>
              </div>
              {scars.length === 0 ? (
                <p className="text-horror-400 italic">No indelible trauma marked upon your soul yet.</p>
              ) : (
                <ul className="space-y-1.5">
                  {scars.map((scar, idx) => (
                    <li key={idx} className="flex items-start space-x-1.5 text-horror-200">
                      <span className="text-blood-500 font-bold">†</span>
                      <span>{scar}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Key Decisions */}
            <div className="p-3 rounded border border-horror-800/80 bg-horror-950/70 space-y-2">
              <div className="flex items-center space-x-1.5 text-horror-200 font-semibold border-b border-horror-800/50 pb-1.5">
                <History className="w-3.5 h-3.5 text-horror-400" />
                <span className="tracking-wide">Past Choices ({decisions.length})</span>
              </div>
              {decisions.length === 0 ? (
                <p className="text-horror-400 italic">Your first fork in the road awaits.</p>
              ) : (
                <ul className="space-y-1.5">
                  {decisions.map((decision, idx) => (
                    <li key={idx} className="flex items-start space-x-1.5 text-horror-300">
                      <span className="text-horror-400 font-mono">›</span>
                      <span>{decision}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
