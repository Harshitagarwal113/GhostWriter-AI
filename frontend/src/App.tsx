import React, { useState, useEffect } from 'react';
import { AtmosphericBackground } from './components/AtmosphericBackground';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { SettingsModal } from './components/SettingsModal';
import { ConnectionBanner } from './components/ConnectionBanner';
import { Toast } from './components/Toast';

import { LandingPage } from './pages/LandingPage';
import { StorySetupPage } from './pages/StorySetupPage';
import { StoryPlayerPage } from './pages/StoryPlayerPage';
import { EndingPage } from './pages/EndingPage';

import { useStorySession } from './hooks/useStorySession';
import { useApiHealth } from './hooks/useApiHealth';
import type { StoryChoice, StorySetup } from './types/story';

type ViewMode = 'landing' | 'setup' | 'playing' | 'ending';

export const App: React.FC = () => {
  const [view, setView] = useState<ViewMode>('landing');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const {
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
  } = useStorySession();

  const {
    health,
    loading: healthLoading,
    error: healthError,
    recheck: recheckHealth,
  } = useApiHealth();

  // If a session exists and is on ending scene, set ending view; otherwise if active session exists, default to playing
  useEffect(() => {
    if (session) {
      if (session.current_scene.is_ending) {
        setView('ending');
      } else {
        setView('playing');
      }
    }
  }, [session]);

  const handleStartSetup = () => {
    setView('setup');
  };

  const handleStartStory = async (setup: StorySetup) => {
    const success = await startNewStory(setup);
    if (success) {
      setView('playing');
    }
  };

  const handleChoice = async (choice: StoryChoice) => {
    const success = await submitChoice(choice);
    if (!success) {
      // Error handled in session state and displayed in ConnectionBanner
    }
  };

  const handleCustomAction = async (actionText: string) => {
    const success = await submitCustomAction(actionText);
    if (!success) {
      // Error handled in session state
    }
  };

  const handlePlayAgain = () => {
    resetSession();
    setView('setup');
  };

  const handleReturnHome = () => {
    resetSession();
    setView('landing');
  };

  const handleCopyStory = async (): Promise<boolean> => {
    try {
      const text = getFullStoryText();
      await navigator.clipboard.writeText(text);
      setToastMessage('Complete chronicle copied to clipboard.');
      return true;
    } catch {
      setToastMessage('Failed to copy to clipboard.');
      return false;
    }
  };

  // Determine current setting for background styling
  const currentSetting = session?.setup.setting;

  return (
    <div className="min-h-screen flex flex-col bg-horror-950 text-horror-100 selection:bg-blood-950 selection:text-blood-200">
      {/* Dynamic Gothic Atmosphere Backdrop */}
      <AtmosphericBackground setting={currentSetting} />

      {/* Persistent App Header */}
      <Header
        onOpenSettings={() => setIsSettingsOpen(true)}
        onHomeClick={view !== 'landing' ? () => setView('landing') : undefined}
        isInStory={view === 'playing'}
        health={health}
        healthLoading={healthLoading}
        healthError={healthError}
      />

      {/* Global Connection / API Error Banner */}
      <ConnectionBanner
        error={error}
        onRetry={retryLastAction}
        onDismiss={clearError}
        retrying={isLoading}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-6xl mx-auto flex flex-col justify-center">
        {view === 'landing' && (
          <LandingPage
            onStartSetup={handleStartSetup}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        )}

        {view === 'setup' && (
          <StorySetupPage
            onStartStory={handleStartStory}
            onCancel={() => setView('landing')}
            isLoading={isLoading}
            loadingMessage={loadingMessage}
          />
        )}

        {view === 'playing' && session && (
          <StoryPlayerPage
            session={session}
            onChoice={handleChoice}
            onCustomAction={handleCustomAction}
            isLoading={isLoading}
            loadingMessage={loadingMessage}
          />
        )}

        {view === 'ending' && session && (
          <EndingPage
            session={session}
            onPlayAgain={handlePlayAgain}
            onReturnHome={handleReturnHome}
            onRateStory={rateStory}
            onCopyStory={handleCopyStory}
          />
        )}
      </main>

      {/* Global Footer */}
      <Footer />

      {/* System Architecture & Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        health={health}
        loading={healthLoading}
        error={healthError}
        onRecheck={recheckHealth}
      />

      {/* Toast Feedback */}
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
    </div>
  );
};

export default App;
