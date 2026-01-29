import { useState, useEffect } from 'react';
import {
  getClaudeApiKey,
  setClaudeApiKey,
  clearClaudeApiKey,
  loadCustomExercises,
  deleteCustomExercise,
  clearChatHistory,
  loadPersonality,
  savePersonality,
  loadUserName,
  saveUserName,
  exportAllDataAsJSON,
  exportWorkoutsAsCSV,
  exportExerciseLogsAsCSV,
} from '../data/storage';
import { getDeviceId } from '../data/sync';
import { Button } from '../components/Button';
import type { Exercise, PersonalityType } from '../types';
import { PERSONALITY_OPTIONS } from '../types';

interface SettingsPageProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export function SettingsPage({ theme, onToggleTheme }: SettingsPageProps) {
  const [apiKey, setApiKeyState] = useState('');
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);
  const [customExercises, setCustomExercises] = useState<Exercise[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [personality, setPersonality] = useState<PersonalityType>('neutral');
  const [userName, setUserName] = useState<string>('');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const deviceId = getDeviceId();

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  };

  useEffect(() => {
    setSavedKey(getClaudeApiKey());
    setCustomExercises(loadCustomExercises());
    setPersonality(loadPersonality());
    setUserName(loadUserName() || '');
  }, []);

  const handleNameChange = (name: string) => {
    setUserName(name);
    saveUserName(name);
  };

  const handlePersonalityChange = (newPersonality: PersonalityType) => {
    setPersonality(newPersonality);
    savePersonality(newPersonality);
  };

  const handleSaveKey = () => {
    if (apiKey.trim()) {
      setClaudeApiKey(apiKey.trim());
      setSavedKey(apiKey.trim());
      setApiKeyState('');
    }
  };

  const handleClearKey = () => {
    clearClaudeApiKey();
    setSavedKey(null);
    setApiKeyState('');
  };

  const handleDeleteExercise = (id: string) => {
    deleteCustomExercise(id);
    setCustomExercises(loadCustomExercises());
    setShowDeleteConfirm(null);
  };

  const handleClearChat = () => {
    clearChatHistory();
  };

  const handleExportJSON = () => {
    const data = exportAllDataAsJSON();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `moove-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportWorkoutsCSV = () => {
    const data = exportWorkoutsAsCSV();
    const blob = new Blob([data], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `moove-workouts-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportExerciseLogsCSV = () => {
    const data = exportExerciseLogsAsCSV();
    const blob = new Blob([data], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `moove-exercise-logs-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const maskedKey = savedKey ? `sk-ant-...${savedKey.slice(-8)}` : null;

  return (
    <div className="min-h-screen pb-24 bg-slate-100 dark:bg-slate-950">
      <header className="px-4 pt-16 pb-4 safe-top">
        <div className="flex items-center gap-2">
          <img src="/logo_icon.png" alt="Moove" className="h-9 dark:invert" />
          <img src="/settings.svg" alt="Settings" className="h-5 dark:invert" />
        </div>
      </header>

      <div className="px-4 space-y-6">
        {/* Profile Section */}
        <section className="p-4 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-none">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">Profile</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Your name for personalized greetings.
          </p>
          <input
            type="text"
            value={userName}
            onChange={e => handleNameChange(e.target.value)}
            placeholder="Enter your name"
            className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </section>

        {/* Appearance Section */}
        <section className="p-4 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-none">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">Appearance</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Choose your preferred color theme.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => theme === 'dark' && onToggleTheme()}
              className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                theme === 'light'
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span className={`text-sm font-medium ${theme === 'light' ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'}`}>
                  Light
                </span>
              </div>
            </button>
            <button
              onClick={() => theme === 'light' && onToggleTheme()}
              className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                theme === 'dark'
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
                <span className={`text-sm font-medium ${theme === 'dark' ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'}`}>
                  Dark
                </span>
              </div>
            </button>
          </div>
        </section>

        {/* Personality Section */}
        <section className="p-4 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-none">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">Personality</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Choose how the app talks to you.
          </p>
          <div className="space-y-2">
            {PERSONALITY_OPTIONS.map(option => (
              <button
                key={option.value}
                onClick={() => handlePersonalityChange(option.value)}
                className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                  personality === option.value
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <div className={`font-medium ${personality === option.value ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'}`}>
                  {option.label}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {option.description}
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Claude API Key Section - Collapsible */}
        <section className="rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-none overflow-hidden">
          <button
            onClick={() => toggleSection('apiKey')}
            className="w-full p-4 flex items-center justify-between text-left"
          >
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Claude API Key</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {savedKey ? 'API key configured' : 'Required for Claude assistant'}
              </p>
            </div>
            <svg className={`w-5 h-5 text-slate-400 transition-transform ${expandedSections.has('apiKey') ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {expandedSections.has('apiKey') && (
            <div className="px-4 pb-4">
          {savedKey ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-100 dark:bg-slate-700/50">
                <div className="flex-1">
                  <span className="text-slate-700 dark:text-slate-300 font-mono text-sm">
                    {showKey ? savedKey : maskedKey}
                  </span>
                </div>
                <button
                  onClick={() => setShowKey(!showKey)}
                  className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {showKey ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    )}
                  </svg>
                </button>
              </div>
              <Button variant="ghost" onClick={handleClearKey} className="w-full">
                Remove API Key
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <input
                type="password"
                value={apiKey}
                onChange={e => setApiKeyState(e.target.value)}
                placeholder="sk-ant-api03-..."
                className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono text-sm"
              />
              <Button
                variant="primary"
                onClick={handleSaveKey}
                disabled={!apiKey.trim()}
                className="w-full"
              >
                Save API Key
              </Button>
              <p className="text-xs text-slate-500">
                Get your API key from{' '}
                <a
                  href="https://console.anthropic.com/settings/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300"
                >
                  console.anthropic.com
                </a>
              </p>
            </div>
          )}
            </div>
          )}
        </section>

        {/* Custom Exercises Section */}
        <section className="p-4 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-none">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">Custom Exercises</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Exercises you've added via the Claude assistant.
          </p>

          {customExercises.length === 0 ? (
            <div className="text-center py-6 text-slate-500">
              No custom exercises yet. Use the Claude assistant to add some!
            </div>
          ) : (
            <div className="space-y-2">
              {customExercises.map(exercise => (
                <div
                  key={exercise.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-100 dark:bg-slate-700/50"
                >
                  <div>
                    <div className="font-medium text-slate-800 dark:text-slate-200">{exercise.name}</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      {exercise.area} • {exercise.equipment}
                    </div>
                  </div>
                  {showDeleteConfirm === exercise.id ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDeleteExercise(exercise.id)}
                        className="px-3 py-1 rounded bg-red-500 text-white text-sm"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(null)}
                        className="px-3 py-1 rounded bg-slate-300 dark:bg-slate-600 text-slate-700 dark:text-slate-200 text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowDeleteConfirm(exercise.id)}
                      className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 p-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Chat History Section - Collapsible */}
        <section className="rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-none overflow-hidden">
          <button
            onClick={() => toggleSection('chatHistory')}
            className="w-full p-4 flex items-center justify-between text-left"
          >
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Chat History</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Clear conversation history</p>
            </div>
            <svg className={`w-5 h-5 text-slate-400 transition-transform ${expandedSections.has('chatHistory') ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {expandedSections.has('chatHistory') && (
            <div className="px-4 pb-4">
              <Button variant="ghost" onClick={handleClearChat} className="w-full">
                Clear Chat History
              </Button>
            </div>
          )}
        </section>

        {/* Data Export - Collapsible */}
        <section className="rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-none overflow-hidden">
          <button
            onClick={() => toggleSection('exportData')}
            className="w-full p-4 flex items-center justify-between text-left"
          >
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Export Data</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Download workout data</p>
            </div>
            <svg className={`w-5 h-5 text-slate-400 transition-transform ${expandedSections.has('exportData') ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {expandedSections.has('exportData') && (
            <div className="px-4 pb-4 space-y-2">
              <Button variant="secondary" onClick={handleExportJSON} className="w-full">
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export All Data (JSON)
                </div>
              </Button>
              <Button variant="secondary" onClick={handleExportWorkoutsCSV} className="w-full">
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export Workouts (CSV)
                </div>
              </Button>
              <Button variant="secondary" onClick={handleExportExerciseLogsCSV} className="w-full">
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export Exercise Logs (CSV)
                </div>
              </Button>
            </div>
          )}
        </section>

        {/* App Info - Collapsible */}
        <section className="rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-none overflow-hidden">
          <button
            onClick={() => toggleSection('about')}
            className="w-full p-4 flex items-center justify-between text-left"
          >
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">About</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Version 1.0.0</p>
            </div>
            <svg className={`w-5 h-5 text-slate-400 transition-transform ${expandedSections.has('about') ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {expandedSections.has('about') && (
            <div className="px-4 pb-4 space-y-2 text-sm text-slate-500 dark:text-slate-400">
              <div className="flex justify-between">
                <span>Version</span>
                <span className="text-slate-700 dark:text-slate-300">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span>Storage</span>
                <span className="text-slate-700 dark:text-slate-300">localStorage</span>
              </div>
              <div className="flex justify-between">
                <span>Device ID</span>
                <span className="text-slate-700 dark:text-slate-300 font-mono text-xs">{deviceId}</span>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
