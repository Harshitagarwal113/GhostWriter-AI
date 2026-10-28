import React, { useState } from 'react';
import {
  ArrowLeft,
  Flame,
  Home,
  Building2,
  TreePine,
  ShieldAlert,
  Ghost,
  Sparkles,
  Timer,
  User,
  AlertCircle,
} from 'lucide-react';
import type { HorrorLevel, SettingChoice, StoryLength, StorySetup } from '../types/story';
import { LoadingAtmosphere } from '../components/LoadingAtmosphere';

interface StorySetupPageProps {
  onStartStory: (setup: StorySetup) => void;
  onCancel: () => void;
  isLoading: boolean;
  loadingMessage: string;
}

interface SettingOption {
  id: SettingChoice;
  title: string;
  tagline: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const SETTINGS: SettingOption[] = [
  {
    id: 'Haunted Mansion',
    title: 'Haunted Mansion',
    tagline: 'Decaying Victorian Manor',
    description: 'Cold drafts through velvet curtains, moving family portraits, and footsteps in sealed attics.',
    icon: Home,
  },
  {
    id: 'Abandoned Hospital',
    title: 'Abandoned Hospital',
    tagline: 'Sterile Wards & Echoes',
    description: 'Flickering emergency bulbs, rusted gurneys, and intercoms crackling with dead voices.',
    icon: Building2,
  },
  {
    id: 'Cursed Village',
    title: 'Cursed Village',
    tagline: 'The Fog-Shrouded Hamlet',
    description: 'Boarded cottages, pagan straw effigies in the square, and townsfolk who never blink.',
    icon: Ghost,
  },
  {
    id: 'Forgotten Asylum',
    title: 'Forgotten Asylum',
    tagline: 'Surrendered Sanity',
    description: 'Damp cell blocks, claw marks gouged into slate, and mechanical hums beneath the foundation.',
    icon: ShieldAlert,
  },
  {
    id: 'Dark Forest',
    title: 'Dark Forest',
    tagline: 'The Ancient Thicket',
    description: 'Twisted black pines, perpetual twilight, and predatory eyes watching from the brambles.',
    icon: TreePine,
  },
];

const HORROR_LEVELS: { id: HorrorLevel; name: string; desc: string; icon: string }[] = [
  {
    id: 'Psychological',
    name: 'Psychological',
    desc: 'Slow-burning dread, sensory distortion, paranoia, and questioning memory.',
    icon: '🕯️',
  },
  {
    id: 'Supernatural',
    name: 'Supernatural',
    desc: 'Apparitions, poltergeist phenomena, spectral anomalies, and occult curses.',
    icon: '👁️',
  },
  {
    id: 'Nightmare',
    name: 'Nightmare',
    desc: 'Visceral cosmic malevolence, relentless tension, and reality fraying at the seams.',
    icon: '🩸',
  },
];

const STORY_LENGTHS: { id: StoryLength; name: string; chapters: string }[] = [
  { id: 'Short', name: 'Short', chapters: '3–4 scenes • Fast-paced encounter' },
  { id: 'Medium', name: 'Medium', chapters: '5–7 scenes • Deepening mystery' },
  { id: 'Long', name: 'Long', chapters: '8–10 scenes • Epic gothic nightmare' },
];

export const StorySetupPage: React.FC<StorySetupPageProps> = ({
  onStartStory,
  onCancel,
  isLoading,
  loadingMessage,
}) => {
  const [setting, setSetting] = useState<SettingChoice>('Haunted Mansion');
  const [horrorLevel, setHorrorLevel] = useState<HorrorLevel>('Psychological');
  const [storyLength, setStoryLength] = useState<StoryLength>('Medium');
  const [protagonistName, setProtagonistName] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!setting) {
      setValidationError('Please select a domain setting for your story.');
      return;
    }

    setValidationError(null);
    onStartStory({
      setting,
      horror_level: horrorLevel,
      story_length: storyLength,
      protagonist_name: protagonistName.trim() || 'The Wanderer',
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 min-h-[70vh] flex items-center justify-center">
        <LoadingAtmosphere
          message={loadingMessage}
          subtext={`Awakening the ${setting} with ${horrorLevel.toLowerCase()} intensity...`}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-inkBleed font-sans">
      {/* Top Navigation */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={onCancel}
          className="inline-flex items-center space-x-2 text-xs text-horror-400 hover:text-horror-100 transition-colors cursor-pointer"
          aria-label="Return to landing page"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return Home</span>
        </button>

        <div className="flex items-center space-x-2 text-xs text-blood-400">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Gemma AI Title Generation Enabled</span>
        </div>
      </div>

      <div className="mb-8 space-y-2">
        <h1 className="font-cinzel text-2xl sm:text-3xl font-bold tracking-wide text-horror-100">
          Configure The Ritual
        </h1>
        <p className="text-xs sm:text-sm text-horror-400">
          Select the location, psychological intensity, and pacing. The AI will weave an unscripted chronicle tailored to your parameters.
        </p>
      </div>

      {validationError && (
        <div
          role="alert"
          className="mb-6 p-3.5 rounded bg-blood-950/80 border border-blood-800 text-blood-200 text-xs flex items-center space-x-2"
        >
          <AlertCircle className="w-4 h-4 text-blood-400 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Step 1: Setting Selection */}
        <div className="space-y-3">
          <label className="block text-xs uppercase tracking-widest text-horror-300 font-semibold">
            1. Select Domain Setting
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {SETTINGS.map((item) => {
              const Icon = item.icon;
              const isSelected = setting === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setSetting(item.id)}
                  role="radio"
                  aria-checked={isSelected}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === ' ' || e.key === 'Enter') {
                      e.preventDefault();
                      setSetting(item.id);
                    }
                  }}
                  className={`p-4 rounded-lg border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'border-blood-600 bg-blood-950/40 shadow-blood-glow'
                      : 'border-horror-800 bg-horror-900/60 hover:border-horror-700 hover:bg-horror-850'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className={`w-8 h-8 rounded flex items-center justify-center ${
                        isSelected
                          ? 'bg-blood-900 text-blood-200'
                          : 'bg-horror-950 text-horror-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    {isSelected && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blood-900 text-blood-200 border border-blood-700">
                        Selected
                      </span>
                    )}
                  </div>
                  <h2 className="font-cinzel text-sm font-semibold text-horror-100">
                    {item.title}
                  </h2>
                  <p className="text-[11px] text-blood-400/90 font-medium mb-1">
                    {item.tagline}
                  </p>
                  <p className="text-xs text-horror-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 2: Horror Intensity */}
        <div className="space-y-3">
          <label className="block text-xs uppercase tracking-widest text-horror-300 font-semibold">
            2. Horror Intensity
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {HORROR_LEVELS.map((lvl) => {
              const isSelected = horrorLevel === lvl.id;
              return (
                <div
                  key={lvl.id}
                  onClick={() => setHorrorLevel(lvl.id)}
                  role="radio"
                  aria-checked={isSelected}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === ' ' || e.key === 'Enter') {
                      e.preventDefault();
                      setHorrorLevel(lvl.id);
                    }
                  }}
                  className={`p-4 rounded-lg border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'border-blood-600 bg-blood-950/40 shadow-blood-glow'
                      : 'border-horror-800 bg-horror-900/60 hover:border-horror-700 hover:bg-horror-850'
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-1.5">
                    <span className="text-lg">{lvl.icon}</span>
                    <span className="font-cinzel text-sm font-semibold text-horror-100">
                      {lvl.name}
                    </span>
                  </div>
                  <p className="text-xs text-horror-400 leading-relaxed">
                    {lvl.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 3: Pacing & Protagonist */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Story Length */}
          <div className="space-y-2">
            <label className="block text-xs uppercase tracking-widest text-horror-300 font-semibold flex items-center space-x-1.5">
              <Timer className="w-3.5 h-3.5 text-blood-400" />
              <span>3. Pacing & Length</span>
            </label>
            <div className="space-y-2">
              {STORY_LENGTHS.map((len) => {
                const isSelected = storyLength === len.id;
                return (
                  <div
                    key={len.id}
                    onClick={() => setStoryLength(len.id)}
                    role="radio"
                    aria-checked={isSelected}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === ' ' || e.key === 'Enter') {
                        e.preventDefault();
                        setStoryLength(len.id);
                      }
                    }}
                    className={`p-3 rounded border flex items-center justify-between cursor-pointer transition-colors ${
                      isSelected
                        ? 'border-blood-600 bg-blood-950/30 text-horror-100'
                        : 'border-horror-800 bg-horror-900/50 hover:border-horror-700 text-horror-400'
                    }`}
                  >
                    <div>
                      <span className="font-semibold text-xs text-horror-200">
                        {len.name}
                      </span>
                      <span className="text-[11px] block text-horror-400">
                        {len.chapters}
                      </span>
                    </div>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-blood-500 shadow-blood-glow" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Protagonist Name */}
          <div className="space-y-2">
            <label
              htmlFor="protagonist-input"
              className="block text-xs uppercase tracking-widest text-horror-300 font-semibold flex items-center space-x-1.5"
            >
              <User className="w-3.5 h-3.5 text-blood-400" />
              <span>4. Protagonist Identity (Optional)</span>
            </label>
            <div className="p-4 rounded border border-horror-800 bg-horror-900/60 space-y-3">
              <input
                id="protagonist-input"
                type="text"
                value={protagonistName}
                onChange={(e) => setProtagonistName(e.target.value)}
                placeholder="Leave blank for 'The Wanderer' or enter a name (e.g., Jonathan Vance)"
                maxLength={40}
                className="w-full bg-horror-950 border border-horror-800 rounded px-3 py-2 text-xs text-horror-100 placeholder:text-horror-400/60 focus:outline-none focus:border-blood-600"
              />
              <p className="text-[11px] text-horror-400 leading-normal">
                Title Preview:{' '}
                <span className="text-horror-200 italic">
                  "{setting}: {protagonistName.trim() || 'The Wanderer'}'s Reckoning"
                </span>{' '}
                <span className="text-blood-400/80">(Generated dynamically by Gemma)</span>
              </p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 flex items-center justify-end space-x-4 border-t border-horror-800/80">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded border border-horror-800 bg-horror-900 text-horror-300 hover:text-horror-100 hover:bg-horror-850 text-xs font-sans transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-7 py-3 rounded bg-blood-900 hover:bg-blood-800 border border-blood-600 text-white font-cinzel font-bold text-sm tracking-wider uppercase transition-all shadow-blood-glow hover:shadow-blood-glow-lg flex items-center space-x-2 cursor-pointer active:scale-95"
          >
            <Flame className="w-4 h-4 text-blood-300" />
            <span>Start Story</span>
          </button>
        </div>
      </form>
    </div>
  );
};
