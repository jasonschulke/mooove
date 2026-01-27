import { useState } from 'react';
import type { WorkoutExercise, EffortLevel } from '../types';
import { getExerciseById, getAlternatives } from '../data/exercises';
import { getLastWeekAverages, getExerciseHistory } from '../data/storage';
import { Timer } from './Timer';
import { EffortPicker } from './EffortPicker';
import { Button } from './Button';

interface ExerciseViewProps {
  workoutExercise: WorkoutExercise;
  blockName: string;
  exerciseNumber: number;
  totalExercises: number;
  onComplete: (log: {
    exerciseId: string;
    weight?: number;
    reps?: number;
    duration?: number;
    effort?: EffortLevel;
  }) => void;
  onSkip: () => void;
  onSwapExercise: (newExerciseId: string) => void;
}

export function ExerciseView({
  workoutExercise,
  blockName,
  exerciseNumber,
  totalExercises,
  onComplete,
  onSkip,
  onSwapExercise,
}: ExerciseViewProps) {
  const exercise = getExerciseById(workoutExercise.exerciseId);
  const [weight, setWeight] = useState<number | undefined>(workoutExercise.weight ?? exercise?.defaultWeight);
  const [reps, setReps] = useState<number | string | undefined>(
    workoutExercise.reps ?? exercise?.defaultReps
  );
  const [effort, setEffort] = useState<EffortLevel | undefined>();
  const [showTimer, setShowTimer] = useState(false);
  const [showAlternatives, setShowAlternatives] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  if (!exercise) {
    return <div className="p-4 text-red-400">Exercise not found</div>;
  }

  const alternatives = getAlternatives(exercise.id);
  const lastWeekAvg = getLastWeekAverages(exercise.id);
  const history = showHistory ? getExerciseHistory(exercise.id, 10) : [];
  const duration = workoutExercise.duration ?? exercise.defaultDuration;

  const handleComplete = () => {
    onComplete({
      exerciseId: exercise.id,
      weight,
      reps: typeof reps === 'number' ? reps : undefined,
      duration,
      effort,
    });
  };

  const equipmentLabel = exercise.equipment.charAt(0).toUpperCase() + exercise.equipment.slice(1);
  const areaLabel = exercise.area.charAt(0).toUpperCase() + exercise.area.slice(1);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 bg-slate-900/50 border-b border-slate-800">
        <div className="text-sm text-slate-400">{blockName}</div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-slate-500">
            Exercise {exerciseNumber} of {totalExercises}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {/* Exercise Name & Area */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-slate-100 mb-2">{exercise.name}</h1>
          <div className="flex justify-center gap-2">
            <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-sm">
              {areaLabel}
            </span>
            <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-sm">
              {equipmentLabel}
            </span>
          </div>
        </div>

        {/* Last Week Stats */}
        {lastWeekAvg && (lastWeekAvg.avgWeight > 0 || lastWeekAvg.avgReps > 0) && (
          <div className="mb-6 p-3 rounded-xl bg-slate-800/50 border border-slate-700">
            <div className="text-xs text-slate-400 mb-1">Last week avg</div>
            <div className="flex gap-4">
              {lastWeekAvg.avgWeight > 0 && (
                <span className="text-slate-200">{lastWeekAvg.avgWeight} lb</span>
              )}
              {lastWeekAvg.avgReps > 0 && (
                <span className="text-slate-200">{lastWeekAvg.avgReps} reps</span>
              )}
            </div>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="mt-2 text-xs text-emerald-400 hover:text-emerald-300"
            >
              {showHistory ? 'Hide history' : 'View all history'}
            </button>
          </div>
        )}

        {/* History */}
        {showHistory && history.length > 0 && (
          <div className="mb-6 p-3 rounded-xl bg-slate-800/30 border border-slate-700 max-h-40 overflow-y-auto">
            <div className="text-xs text-slate-400 mb-2">Recent History</div>
            {history.map((log, i) => (
              <div key={i} className="flex justify-between text-sm py-1 border-b border-slate-700 last:border-0">
                <span className="text-slate-500">
                  {new Date(log.completedAt).toLocaleDateString()}
                </span>
                <span className="text-slate-300">
                  {log.weight && `${log.weight}lb`} {log.reps && `× ${log.reps}`}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Timer Section */}
        {(duration || showTimer) && (
          <div className={`mb-6 rounded-xl bg-slate-800/50 border border-slate-700 ${showTimer ? 'p-2' : 'p-4'}`}>
            <Timer
              duration={duration}
              enlarged={showTimer}
              autoStart={false}
            />
            {!showTimer && (
              <button
                onClick={() => setShowTimer(true)}
                className="w-full mt-2 text-sm text-emerald-400 hover:text-emerald-300"
              >
                Enlarge timer
              </button>
            )}
            {showTimer && (
              <button
                onClick={() => setShowTimer(false)}
                className="w-full mt-2 text-sm text-slate-400 hover:text-slate-300"
              >
                Minimize timer
              </button>
            )}
          </div>
        )}

        {/* Weight & Reps Input */}
        {!duration && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            {exercise.equipment !== 'bodyweight' && (
              <div>
                <label className="block text-sm text-slate-400 mb-2">Weight (lb)</label>
                <input
                  type="number"
                  value={weight || ''}
                  onChange={e => setWeight(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-lg text-center focus:outline-none focus:border-emerald-500"
                  placeholder="0"
                />
              </div>
            )}
            <div className={exercise.equipment === 'bodyweight' ? 'col-span-2' : ''}>
              <label className="block text-sm text-slate-400 mb-2">Reps</label>
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
                className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-lg text-center focus:outline-none focus:border-emerald-500"
                placeholder="0"
              />
            </div>
          </div>
        )}

        {/* Effort Level */}
        <div className="mb-6">
          <label className="block text-sm text-slate-400 mb-3">Effort Level (optional)</label>
          <EffortPicker value={effort} onChange={setEffort} />
        </div>

        {/* Alternatives */}
        {alternatives.length > 0 && (
          <div className="mb-6">
            <button
              onClick={() => setShowAlternatives(!showAlternatives)}
              className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-300"
            >
              <svg className={`w-4 h-4 transition-transform ${showAlternatives ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              Swap exercise
            </button>
            {showAlternatives && (
              <div className="mt-3 space-y-2">
                {alternatives.map(alt => (
                  <button
                    key={alt.id}
                    onClick={() => onSwapExercise(alt.id)}
                    className="w-full p-3 rounded-xl bg-slate-800/50 border border-slate-700 text-left hover:bg-slate-800 transition-colors"
                  >
                    <div className="font-medium text-slate-200">{alt.name}</div>
                    <div className="text-sm text-slate-400">{alt.equipment}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Description */}
        {exercise.description && (
          <div className="text-sm text-slate-400 italic mb-6">
            {exercise.description}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="px-4 py-4 bg-slate-900/80 border-t border-slate-800 safe-bottom">
        <div className="flex gap-3">
          <Button variant="ghost" onClick={onSkip} className="flex-1">
            Skip
          </Button>
          <Button variant="primary" onClick={handleComplete} className="flex-[2]">
            Complete
          </Button>
        </div>
      </div>
    </div>
  );
}
