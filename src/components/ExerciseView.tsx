import { useState, useEffect } from 'react';
import type { WorkoutExercise } from '../types';
import { getExerciseById, getAlternatives } from '../data/exercises';
import { getLastWeekAverages, getDefaultWeightForEquipment } from '../data/storage';
import { fetchExerciseGif } from '../utils/exerciseGifs';
import { Timer } from './Timer';

interface ExerciseViewProps {
  workoutExercise: WorkoutExercise;
  onComplete: (log: {
    exerciseId: string;
    weight?: number;
    reps?: number;
    duration?: number;
  }) => void;
  onSkip: () => void;
  onSwapExercise: (newExerciseId: string) => void;
  onBack?: () => void;
  canGoBack?: boolean;
  compact?: boolean;
}

export function ExerciseView({
  workoutExercise,
  onComplete,
  onSkip,
  onSwapExercise,
  onBack,
  canGoBack = false,
  compact = false,
}: ExerciseViewProps) {
  const exercise = getExerciseById(workoutExercise.exerciseId);
  const lastWeekAvg = exercise ? getLastWeekAverages(exercise.id) : null;

  // Weight priority: explicit workout value > last week avg > equipment default > exercise default
  const getInitialWeight = (): number | undefined => {
    if (workoutExercise.weight) return workoutExercise.weight;
    if (lastWeekAvg?.avgWeight && lastWeekAvg.avgWeight > 0) return lastWeekAvg.avgWeight;
    if (exercise) return getDefaultWeightForEquipment(exercise.equipment) ?? exercise.defaultWeight;
    return undefined;
  };

  // Reps priority: explicit workout value > last week avg > exercise default
  const getInitialReps = (): number | string | undefined => {
    if (workoutExercise.reps) return workoutExercise.reps;
    if (lastWeekAvg?.avgReps && lastWeekAvg.avgReps > 0) return lastWeekAvg.avgReps;
    return exercise?.defaultReps;
  };

  const [weight, setWeight] = useState<number | undefined>(getInitialWeight);
  const [reps, setReps] = useState<number | string | undefined>(getInitialReps);
  const [showTimer, setShowTimer] = useState(false);
  const [gifUrl, setGifUrl] = useState<string | null>(null);
  const [gifLoading, setGifLoading] = useState(true);

  // Reset state when exercise changes - fixes the weight/reps auto-apply bug
  useEffect(() => {
    setWeight(getInitialWeight());
    setReps(getInitialReps());
    setShowTimer(false);
  }, [workoutExercise.exerciseId]);

  // Fetch exercise GIF
  useEffect(() => {
    if (exercise) {
      setGifLoading(true);
      fetchExerciseGif(exercise.name).then(url => {
        setGifUrl(url);
        setGifLoading(false);
      });
    }
  }, [exercise?.name]);

  if (!exercise) {
    return <div className="p-4 text-red-400">Exercise not found</div>;
  }

  const alternatives = getAlternatives(exercise.id);
  const duration = workoutExercise.duration ?? exercise.defaultDuration;

  const handleComplete = () => {
    onComplete({
      exerciseId: exercise.id,
      weight,
      reps: typeof reps === 'number' ? reps : undefined,
      duration,
    });
  };

  const equipmentLabel = exercise.equipment.charAt(0).toUpperCase() + exercise.equipment.slice(1);
  const areaLabel = exercise.area.charAt(0).toUpperCase() + exercise.area.slice(1);

  return (
    <div className={`flex flex-col ${compact ? 'h-full' : ''}`}>
      {/* Main Content */}
      <div className={`${compact ? 'px-4 py-4 flex-1 flex flex-col justify-between' : 'px-5 py-6'}`}>
        {/* Hero: Exercise Name - larger for TV viewing */}
        <div className={`${compact ? 'mb-2' : 'text-center mb-2'}`}>
          {compact ? (
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 truncate">{exercise.name}</h1>
              <span className="px-2 py-0.5 text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-md whitespace-nowrap flex-shrink-0">
                {areaLabel} · {equipmentLabel}
              </span>
            </div>
          ) : (
            <>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{exercise.name}</h1>
              <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {areaLabel} · {equipmentLabel}
              </div>
            </>
          )}
        </div>

        {/* Exercise GIF - hide in compact mode to save space */}
        {gifUrl && !gifLoading && !compact && (
          <div className="flex justify-center mb-4">
            <img
              src={gifUrl}
              alt={`${exercise.name} demonstration`}
              className="w-32 h-32 object-contain rounded-lg bg-slate-100 dark:bg-slate-800"
              loading="lazy"
            />
          </div>
        )}

        {/* Middle section - inputs and info */}
        <div>
          {/* Timer - Collapsible */}
          {showTimer && (
            <div className={compact ? 'mb-3' : 'mb-6'}>
              <Timer autoStart={true} />
            </div>
          )}

          {/* Description/Instructions - Now above inputs */}
          <div className={`${compact ? 'px-3 py-2 mb-3' : 'mb-4 px-3 py-2'} rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 ${compact ? '' : 'min-h-[72px]'}`}>
            {!compact && (
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-0.5 uppercase tracking-wide">How to</div>
            )}
            <p className={`${compact ? 'text-sm line-clamp-2' : 'text-sm line-clamp-2'} text-slate-600 dark:text-slate-300 leading-relaxed`}>
              {exercise.description || 'Perform the exercise with controlled movement and proper form.'}
            </p>
          </div>

          {/* Weight & Reps Input */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wide">Weight</label>
              <div className="relative">
                {exercise.equipment === 'bodyweight' ? (
                  <div className={`w-full px-3 ${compact ? 'py-2.5' : 'py-2.5'} rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 ${compact ? 'text-base' : 'text-base'} font-medium text-center`}>
                    Bodyweight
                  </div>
                ) : (
                  <>
                    <input
                      type="number"
                      value={weight || ''}
                      onChange={e => setWeight(e.target.value ? Number(e.target.value) : undefined)}
                      className={`w-full px-3 ${compact ? 'py-2.5' : 'py-2.5'} rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 ${compact ? 'text-lg' : 'text-lg'} font-semibold text-center focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500 transition-colors`}
                      placeholder="—"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">lb</span>
                  </>
                )}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wide">
                {duration ? 'Duration' : 'Reps'}
              </label>
              {duration ? (
                <div className={`w-full px-3 ${compact ? 'py-2.5' : 'py-2.5'} rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 ${compact ? 'text-base' : 'text-base'} font-medium text-center`}>
                  {duration}s
                </div>
              ) : (
                <input
                  type={reps === 'AMRAP' ? 'text' : 'number'}
                  value={reps === 'AMRAP' ? 'AMRAP' : reps || ''}
                  onChange={e => {
                    const val = e.target.value;
                    if (val.toUpperCase() === 'AMRAP') {
                      setReps('AMRAP');
                    } else {
                      setReps(val ? Number(val) : undefined);
                    }
                  }}
                  className={`w-full px-3 ${compact ? 'py-2.5' : 'py-2.5'} rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 ${compact ? 'text-lg' : 'text-lg'} font-semibold text-center focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500 transition-colors`}
                  placeholder="—"
                />
              )}
            </div>
          </div>
        </div>

        {/* Swap - Always visible */}
        <div className={`text-center ${compact ? 'pt-2' : 'h-5'}`}>
          {alternatives.length > 0 ? (
            <>
              <span className={`${compact ? 'text-xs' : 'text-sm'} text-slate-400 dark:text-slate-500`}>Swap: </span>
              {alternatives.map((alt, idx) => (
                <span key={alt.id}>
                  <button
                    onClick={() => onSwapExercise(alt.id)}
                    className={`${compact ? 'text-xs' : 'text-sm'} text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300`}
                  >
                    {alt.name}
                  </button>
                  {idx < alternatives.length - 1 && <span className="text-slate-300 dark:text-slate-600 mx-1">·</span>}
                </span>
              ))}
            </>
          ) : (
            <span className={`${compact ? 'text-xs' : 'text-sm'} text-slate-300 dark:text-slate-700`}>No alternatives available</span>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className={`${compact ? 'px-4 py-3' : 'px-5 py-4'} border-t border-slate-200 dark:border-slate-800`}>
        <div className={`flex ${compact ? 'gap-2' : 'gap-3'}`}>
          {/* Back button */}
          {canGoBack && onBack && (
            <button
              onClick={onBack}
              className={`${compact ? 'py-2.5 px-3' : 'py-3.5 px-4'} rounded-xl transition-colors bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-500 dark:text-slate-400`}
              title="Previous exercise"
            >
              <svg className={compact ? 'w-4 h-4' : 'w-5 h-5'} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <button
            onClick={() => setShowTimer(!showTimer)}
            className={`${compact ? 'py-2.5 px-3' : 'py-3.5 px-4'} rounded-xl transition-colors ${
              showTimer
                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-500 dark:text-slate-400'
            }`}
            title="Timer"
          >
            <svg className={compact ? 'w-4 h-4' : 'w-5 h-5'} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          <button
            onClick={onSkip}
            className={`flex-1 ${compact ? 'py-2.5 px-4 text-sm' : 'py-3.5 px-6 text-base'} rounded-xl font-semibold transition-colors bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200`}
          >
            Skip
          </button>
          <button
            onClick={handleComplete}
            className={`flex-1 ${compact ? 'py-2.5 px-4 text-sm' : 'py-3.5 px-6 text-base'} rounded-xl font-semibold transition-colors bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25`}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
