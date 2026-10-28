import { useState, useEffect, useCallback, useRef } from 'react';
import type {
  ApiError,
  StoryChoice,
  StorySession,
  StorySetup,
} from '../types/story';
import { advanceStory, startStory } from '../services/api';

const STORAGE_KEY = 'ghostwriter_active_session_v1';

const ATMOSPHERIC_MESSAGES = [
  'Something is waking up...',
  'The shadows rearrange themselves...',
  'The ink begins to seep across the floorboards...',
  'A cold breath grazes the back of your neck...',
  'Listening for footsteps in the dark...',
  'The walls remember every breath you took...',
  'Unraveling the threads of your fate...',
  'Footsteps pause right behind the door...',
];

interface LastActionState {
  type: 'start' | 'choice' | 'custom';
  setup?: StorySetup;
  choice?: StoryChoice;
  customText?: string;
}

export function useStorySession() {
  const [session, setSession] = useState<StorySession | null>(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored) as StorySession;
      }
    } catch {
      // Ignore storage read error
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(ATMOSPHERIC_MESSAGES[0]);
  const [error, setError] = useState<ApiError | null>(null);
  const lastActionRef = useRef<LastActionState | null>(null);

  // Sync session state to sessionStorage
  useEffect(() => {
    try {
      if (session) {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      } else {
        sessionStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // Ignore storage write issues
    }
  }, [session]);

  // Rotate atmospheric messages during loading
  useEffect(() => {
    if (!isLoading) return;
    let index = 0;
    setLoadingMessage(ATMOSPHERIC_MESSAGES[0]);

    const interval = setInterval(() => {
      index = (index + 1) % ATMOSPHERIC_MESSAGES.length;
      setLoadingMessage(ATMOSPHERIC_MESSAGES[index]);
    }, 3200);

    return () => clearInterval(interval);
  }, [isLoading]);

  const startNewStory = useCallback(async (setup: StorySetup): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    lastActionRef.current = { type: 'start', setup };

    try {
      const scene = await startStory(setup);
      const newSession: StorySession = {
        story_id: scene.story_id,
        title: scene.title || `${setup.setting} Chronicle`,
        setup,
        current_scene: scene,
        history: [
          {
            scene_number: scene.scene_number,
            narrative: scene.narrative,
          },
        ],
        started_at: new Date().toISOString(),
      };
      setSession(newSession);
      setError(null);
      return true;
    } catch (err: unknown) {
      setError(err as ApiError);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const submitChoice = useCallback(
    async (choice: StoryChoice): Promise<boolean> => {
      if (!session) return false;
      setIsLoading(true);
      setError(null);
      lastActionRef.current = { type: 'choice', choice };

      try {
        const nextScene = await advanceStory({
          story_id: session.story_id,
          choice_id: choice.id,
        });

        setSession((prev) => {
          if (!prev) return null;
          const updatedHistory = [
            ...prev.history,
            {
              scene_number: nextScene.scene_number,
              narrative: nextScene.narrative,
              chosen_text: choice.text,
              chosen_id: choice.id,
            },
          ];
          return {
            ...prev,
            title: nextScene.title || prev.title,
            current_scene: nextScene,
            history: updatedHistory,
          };
        });
        setError(null);
        return true;
      } catch (err: unknown) {
        setError(err as ApiError);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [session]
  );

  const submitCustomAction = useCallback(
    async (customText: string): Promise<boolean> => {
      if (!session || !customText.trim()) return false;
      setIsLoading(true);
      setError(null);
      lastActionRef.current = { type: 'custom', customText };

      try {
        const nextScene = await advanceStory({
          story_id: session.story_id,
          custom_action: customText.trim(),
        });

        setSession((prev) => {
          if (!prev) return null;
          const updatedHistory = [
            ...prev.history,
            {
              scene_number: nextScene.scene_number,
              narrative: nextScene.narrative,
              custom_action: customText.trim(),
            },
          ];
          return {
            ...prev,
            title: nextScene.title || prev.title,
            current_scene: nextScene,
            history: updatedHistory,
          };
        });
        setError(null);
        return true;
      } catch (err: unknown) {
        setError(err as ApiError);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [session]
  );

  const retryLastAction = useCallback(async (): Promise<boolean> => {
    const last = lastActionRef.current;
    if (!last) return false;

    if (last.type === 'start' && last.setup) {
      return startNewStory(last.setup);
    }
    if (last.type === 'choice' && last.choice) {
      return submitChoice(last.choice);
    }
    if (last.type === 'custom' && last.customText) {
      return submitCustomAction(last.customText);
    }
    return false;
  }, [startNewStory, submitChoice, submitCustomAction]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const rateStory = useCallback((rating: number) => {
    setSession((prev) => (prev ? { ...prev, rating } : null));
  }, []);

  const resetSession = useCallback(() => {
    setSession(null);
    setError(null);
    lastActionRef.current = null;
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  }, []);

  const getFullStoryText = useCallback((): string => {
    if (!session) return '';
    const lines: string[] = [];
    lines.push(`=== ${session.title.toUpperCase()} ===`);
    lines.push(`Setting: ${session.setup.setting} | Intensity: ${session.setup.horror_level}`);
    lines.push(`Protagonist: ${session.setup.protagonist_name || 'The Wanderer'}`);
    lines.push(`----------------------------------------\n`);

    session.history.forEach((item, idx) => {
      lines.push(`[Chapter ${item.scene_number || idx + 1}]`);
      lines.push(item.narrative);
      if (item.chosen_text) {
        lines.push(`> Action Taken: ${item.chosen_text}`);
      } else if (item.custom_action) {
        lines.push(`> Custom Action: ${item.custom_action}`);
      }
      lines.push('');
    });

    if (session.current_scene.is_ending && session.current_scene.ending) {
      const e = session.current_scene.ending;
      lines.push(`=== ENDING: ${e.title} (${e.ending_type}) ===`);
      if (e.final_narrative) lines.push(e.final_narrative);
      if (e.summary) lines.push(`\nSummary: ${e.summary}`);
      if (e.unresolved_mysteries && e.unresolved_mysteries.length > 0) {
        lines.push('\nUnresolved Mysteries:');
        e.unresolved_mysteries.forEach((m) => lines.push(`- ${m}`));
      }
    }

    lines.push(`\nGenerated via Ghostwriter AI (Gemma on Gemini API)`);
    return lines.join('\n');
  }, [session]);

  return {
    session,
    isLoading,
    loadingMessage,
    error,
    startNewStory,
    submitChoice,
    submitCustomAction,
    retryLastAction,
    clearError,
    rateStory,
    resetSession,
    getFullStoryText,
  };
}
