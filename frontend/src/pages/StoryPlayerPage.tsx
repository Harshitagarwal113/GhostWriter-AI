import React, { useState, useRef, useEffect } from 'react';
import {
  Skull,
  Bookmark,
  BookOpen,
  Volume2,
  VolumeX,
} from 'lucide-react';
import type { StoryChoice, StorySession } from '../types/story';
import { StoryChoices } from '../components/StoryChoices';
import { CustomActionInput } from '../components/CustomActionInput';
import { DarknessRemembersPanel } from '../components/DarknessRemembersPanel';
import { LoadingAtmosphere } from '../components/LoadingAtmosphere';

interface StoryPlayerPageProps {
  session: StorySession;
  onChoice: (choice: StoryChoice) => void;
  onCustomAction: (actionText: string) => void;
  isLoading: boolean;
  loadingMessage: string;
}

export const StoryPlayerPage: React.FC<StoryPlayerPageProps> = ({
  session,
  onChoice,
  onCustomAction,
  isLoading,
  loadingMessage,
}) => {
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(true);
  const narrativeRef = useRef<HTMLDivElement>(null);

  const currentScene = session.current_scene;
  const sceneNumber = currentScene.scene_number || session.history.length;
  const totalEstimatedScenes =
    session.setup.story_length === 'Short'
      ? 4
      : session.setup.story_length === 'Medium'
      ? 7
      : 10;
  const progressPercent = Math.min(
    Math.round((sceneNumber / totalEstimatedScenes) * 100),
    100
  );

  // Scroll to narrative top whenever a new scene lands
  useEffect(() => {
    if (narrativeRef.current) {
      narrativeRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [currentScene.scene_number]);

  // Helper to render narrative with dialogue highlighting
  const renderFormattedNarrative = (text: string) => {
    if (!text) return null;

    const paragraphs = text.split(/\n\n+/).filter((p) => p.trim().length > 0);

    return paragraphs.map((para, pIdx) => {
      // Check if paragraph is primarily dialogue or quotes
      const isPureDialogue = /^["“'].+["”']$/.test(para.trim());

      return (
        <p
          key={pIdx}
          className={`leading-relaxed tracking-normal font-serif text-base sm:text-lg text-horror-100 ${
            isPureDialogue
              ? 'story-dialogue my-4 text-blood-200'
              : 'my-3.5 text-horror-200'
          }`}
        >
          {para}
        </p>
      );
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 font-sans animate-inkBleed">
      {/* Top Story Header & Pacing Bar */}
      <div className="space-y-3 pb-3 border-b border-horror-800/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center space-x-2 text-xs text-blood-400 font-sans tracking-widest uppercase">
              <Skull className="w-3.5 h-3.5" />
              <span>Scene {sceneNumber} of {totalEstimatedScenes}</span>
              <span className="text-horror-400">•</span>
              <span className="text-horror-400">{session.setup.setting}</span>
            </div>
            <h1 className="font-cinzel text-xl sm:text-2xl md:text-3xl font-bold text-horror-100 tracking-wide mt-1">
              {session.title || currentScene.title}
            </h1>
          </div>

          {/* Utility buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowHistoryModal(true)}
              className="px-3 py-1.5 rounded border border-horror-800 bg-horror-900/80 text-horror-300 hover:text-horror-100 hover:border-horror-700 text-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
              title="View recap of previous chapters"
              aria-label="View story recap"
            >
              <BookOpen className="w-3.5 h-3.5 text-horror-400" />
              <span>Recap ({session.history.length})</span>
            </button>

            <button
              onClick={() => setIsAudioMuted(!isAudioMuted)}
              className="p-1.5 rounded border border-horror-800 bg-horror-900/80 text-horror-400 hover:text-horror-200 text-xs transition-colors cursor-pointer"
              title={isAudioMuted ? 'Atmospheric audio muted' : 'Mute atmospheric audio'}
              aria-label={isAudioMuted ? 'Unmute audio' : 'Mute audio'}
            >
              {isAudioMuted ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4 text-blood-400" />
              )}
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-horror-950 rounded-full h-1.5 border border-horror-850 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blood-800 to-blood-600 h-full rounded-full transition-all duration-700 shadow-blood-glow"
            style={{ width: `${progressPercent}%` }}
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>

      {/* Narrative Container */}
      <div
        ref={narrativeRef}
        className="p-6 sm:p-8 rounded-lg border border-horror-800/90 bg-horror-900/70 shadow-2xl relative overflow-hidden backdrop-blur-xs transition-all"
      >
        <div className="absolute top-0 left-0 w-1.5 h-full bg-blood-800/60" />

        <div className="flex items-center justify-between mb-4 pb-2 border-b border-horror-800/50 text-xs text-horror-400 font-sans">
          <span className="flex items-center space-x-2">
            <Bookmark className="w-3.5 h-3.5 text-blood-400" />
            <span className="uppercase tracking-widest font-semibold text-horror-300">
              Passage {sceneNumber}
            </span>
          </span>
          <span className="italic text-horror-400">
            Protagonist: {session.setup.protagonist_name || 'The Wanderer'}
          </span>
        </div>

        {/* Story Text */}
        <div className="prose prose-invert max-w-none">
          {renderFormattedNarrative(currentScene.narrative)}
        </div>
      </div>

      {/* Decision Section or Loading State */}
      {isLoading ? (
        <LoadingAtmosphere
          message={loadingMessage}
          subtext="Gemma AI is rendering the weight of your action..."
        />
      ) : (
        <div className="p-5 sm:p-6 rounded-lg border border-horror-800/80 bg-horror-900/60 shadow-xl space-y-4">
          {/* Three Dynamic Choices */}
          <StoryChoices
            choices={currentScene.choices}
            onSelectChoice={onChoice}
            disabled={isLoading}
          />

          {/* Custom Action Input */}
          <CustomActionInput onSubmit={onCustomAction} disabled={isLoading} />
        </div>
      )}

      {/* Collapsible Darkness Remembers Panel */}
      <DarknessRemembersPanel
        memory={currentScene.memory}
        setup={session.setup}
        sceneNumber={sceneNumber}
      />

      {/* Previous Chapters Recap Modal */}
      {showHistoryModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-inkBleed"
          role="dialog"
          aria-modal="true"
          aria-labelledby="recap-title"
        >
          <div className="w-full max-w-2xl max-h-[80vh] flex flex-col bg-horror-900 border border-horror-800 rounded-lg p-6 shadow-2xl text-horror-100">
            <div className="flex items-center justify-between pb-3 border-b border-horror-800 mb-4">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-blood-400" />
                <h2 id="recap-title" className="font-cinzel text-base font-bold tracking-wide">
                  Chronicle Recap: {session.title}
                </h2>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-xs text-horror-400 hover:text-white px-2 py-1 rounded bg-horror-800"
              >
                Close
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2 font-serif text-sm">
              {session.history.map((hist, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded border border-horror-800/70 bg-horror-950/60 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs font-sans text-blood-400">
                    <span className="font-semibold uppercase tracking-wider">
                      Chapter {hist.scene_number || idx + 1}
                    </span>
                    {hist.chosen_text && (
                      <span className="text-horror-400 italic">
                        Choice: {hist.chosen_text}
                      </span>
                    )}
                    {hist.custom_action && (
                      <span className="text-horror-400 italic">
                        Custom Action: {hist.custom_action}
                      </span>
                    )}
                  </div>
                  <p className="text-horror-200 leading-relaxed">
                    {hist.narrative}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
