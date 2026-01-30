import { useMemo, useState } from 'react';
import type { WorkoutBlock, SavedWorkout, CardioType } from '../types';
import { CARDIO_TYPE_LABELS } from '../types';
import { getLastWorkout, loadSavedWorkouts } from '../data/storage';
import { getExerciseById } from '../data/exercises';

// Material icons for cardio types
const CARDIO_ICONS: Record<CardioType, string> = {
  'walk': 'directions_walk',
  'run': 'sprint',
  'trail-run': 'directions_run',
  'hike': 'hiking',
};

interface WorkoutStartFlowProps {
  onStartLastWorkout: (blocks: WorkoutBlock[]) => void;
  onCreateNew: () => void;
  onStartSavedWorkout: (workout: SavedWorkout) => void;
  onPreviewWorkout: (workout: SavedWorkout) => void;
  onStartCardio: (type: CardioType) => void;
  onManageLibrary: () => void;
}

export function WorkoutStartFlow({
  onStartLastWorkout,
  onCreateNew,
  onStartSavedWorkout,
  onPreviewWorkout,
  onStartCardio,
  onManageLibrary,
}: WorkoutStartFlowProps) {
  const lastWorkout = useMemo(() => getLastWorkout(), []);
  const savedWorkouts = useMemo(() => loadSavedWorkouts(), []);
  const [previewWorkout, setPreviewWorkout] = useState<SavedWorkout | null>(null);

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  const getExerciseCount = (blocks: WorkoutBlock[]) => {
    return blocks.reduce((acc, b) => acc + b.exercises.length, 0);
  };

  return (
    <div className="min-h-screen pb-24 bg-slate-100 dark:bg-slate-950">
      {/* Header */}
      <header className="px-4 pt-16 pb-6 safe-top">
        <div className="flex items-center gap-2">
          <img src="/logo_icon.png" alt="Moove" className="h-9 dark:invert" />
          <img src="/workout.svg" alt="Workout" className="h-5 dark:invert" />
        </div>
      </header>

      <div className="px-4 space-y-8">
        {/* Create New Workout */}
        <div>
          <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">Create a New Workout</h2>
          <button
            onClick={onCreateNew}
            className="w-full p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all active:scale-[0.99]"
          >
            <div className="flex items-center gap-4">
              <div className="flex-1 text-left">
                <div className="font-semibold text-slate-900 dark:text-slate-100 text-lg">Custom Workout</div>
                <div className="text-slate-500 dark:text-slate-400 text-sm">Build with exercises, sets & blocks</div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center flex-shrink-0">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
              </div>
            </div>
          </button>
        </div>

        {/* Saved Workouts */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Start a Saved Workout</h2>
            {savedWorkouts.length > 0 && (
              <button
                onClick={onManageLibrary}
                className="text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300"
              >
                Manage
              </button>
            )}
          </div>
          {savedWorkouts.length > 0 ? (
            <div className="space-y-2">
              {/* Repeat Last as first option if available */}
              {lastWorkout && (
                <button
                  onClick={() => onStartLastWorkout(lastWorkout.blocks)}
                  className="w-full p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-left hover:border-emerald-300 dark:hover:border-emerald-700 transition-all active:scale-[0.99]"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-slate-900 dark:text-slate-100">Repeat Last Workout</div>
                      <div className="text-sm text-slate-500 dark:text-slate-400 truncate">
                        {getExerciseCount(lastWorkout.blocks)} exercises • {formatTimeAgo(lastWorkout.completedAt)}
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-slate-300 dark:text-slate-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              )}
              {savedWorkouts.slice(0, 5).map(workout => (
                <div
                  key={workout.id}
                  className="flex items-center gap-2 p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all"
                >
                  <button
                    onClick={() => setPreviewWorkout(workout)}
                    className="p-2 -ml-2 text-slate-400 hover:text-emerald-500 dark:text-slate-500 dark:hover:text-emerald-400 transition-colors"
                    title="Preview workout"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>visibility</span>
                  </button>
                  <button
                    onClick={() => onStartSavedWorkout(workout)}
                    className="flex-1 text-left active:scale-[0.99]"
                  >
                    <div className="font-medium text-slate-900 dark:text-slate-100">{workout.name}</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                      {getExerciseCount(workout.blocks)} exercises
                      {workout.estimatedMinutes && ` • ~${workout.estimatedMinutes} min`}
                    </div>
                  </button>
                  <svg className="w-5 h-5 text-slate-300 dark:text-slate-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                No saved workouts yet. Create one above!
              </p>
            </div>
          )}
        </div>

        {/* Timed Activities */}
        <div>
          <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">Start a Timed Activity</h2>
          <div className="grid grid-cols-2 gap-3">
            {(['walk', 'run', 'trail-run', 'hike'] as CardioType[]).map((type) => (
              <button
                key={type}
                onClick={() => onStartCardio(type)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all active:scale-[0.98]"
              >
                <span className="material-symbols-outlined text-slate-600 dark:text-slate-400" style={{ fontSize: '24px' }}>{CARDIO_ICONS[type]}</span>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{CARDIO_TYPE_LABELS[type]}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {previewWorkout && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50" onClick={() => setPreviewWorkout(null)}>
          <div className="bg-white dark:bg-slate-800 rounded-t-2xl w-full max-w-lg max-h-[80vh] overflow-hidden shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{previewWorkout.name}</h3>
              <button
                onClick={() => setPreviewWorkout(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[60vh] space-y-4">
              {previewWorkout.blocks.map((block, blockIdx) => (
                <div key={blockIdx} className="rounded-xl bg-slate-50 dark:bg-slate-900 p-3">
                  <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{block.name}</h4>
                  <div className="space-y-1">
                    {block.exercises.map((ex, exIdx) => {
                      const exercise = getExerciseById(ex.exerciseId);
                      return (
                        <div key={exIdx} className="flex items-center gap-2 text-sm">
                          <span className="text-slate-400 dark:text-slate-500 w-5 text-right">{exIdx + 1}.</span>
                          <span className="text-slate-700 dark:text-slate-300">{exercise?.name || ex.exerciseId}</span>
                          {ex.sets && <span className="text-slate-400 dark:text-slate-500 text-xs">Set {ex.sets}</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={() => {
                  onStartSavedWorkout(previewWorkout);
                  setPreviewWorkout(null);
                }}
                className="w-full py-3 rounded-xl font-semibold text-white bg-emerald-500 hover:bg-emerald-600 transition-colors"
              >
                Start Workout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
