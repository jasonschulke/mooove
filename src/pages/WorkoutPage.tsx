import { useState, useMemo } from 'react';
import type { WorkoutSession, EffortLevel } from '../types';
import { workoutTemplates } from '../data/workouts';
import { ExerciseView } from '../components/ExerciseView';
import { EffortPicker } from '../components/EffortPicker';
import { Button } from '../components/Button';

interface WorkoutPageProps {
  session: WorkoutSession | null;
  currentBlockIndex: number;
  currentExerciseIndex: number;
  onLogExercise: (log: {
    exerciseId: string;
    weight?: number;
    reps?: number;
    duration?: number;
    effort?: EffortLevel;
  }) => void;
  onNextExercise: (totalInBlock: number, totalBlocks: number) => void;
  onPreviousExercise: (getBlockCount: (index: number) => number) => void;
  onCompleteWorkout: (effort?: EffortLevel) => void;
  onCancelWorkout: () => void;
  onStartQuickWorkout: () => void;
}

export function WorkoutPage({
  session,
  currentBlockIndex,
  currentExerciseIndex,
  onLogExercise,
  onNextExercise,
  onCompleteWorkout,
  onCancelWorkout,
  onStartQuickWorkout,
}: WorkoutPageProps) {
  const [swappedExercises, setSwappedExercises] = useState<Record<string, string>>({});
  const [showComplete, setShowComplete] = useState(false);
  const [finalEffort, setFinalEffort] = useState<EffortLevel | undefined>();
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const template = useMemo(() => {
    if (!session?.templateId) return null;
    return workoutTemplates.find(t => t.id === session.templateId) || null;
  }, [session?.templateId]);

  // No active workout
  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 pb-24">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-800 flex items-center justify-center">
            <svg className="w-10 h-10 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-slate-200 mb-2">No Active Workout</h2>
          <p className="text-slate-400 mb-6">Start a workout from the home screen</p>
          <Button variant="primary" size="lg" onClick={onStartQuickWorkout}>
            Quick Start
          </Button>
        </div>
      </div>
    );
  }

  // Quick workout without template
  if (!template) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 pb-24">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-slate-200 mb-2">Quick Workout</h2>
          <p className="text-slate-400 mb-6">
            Started at {new Date(session.startedAt).toLocaleTimeString()}
          </p>
          <p className="text-slate-500 mb-6">
            {session.exercises.length} exercises logged
          </p>
          <Button variant="primary" size="lg" onClick={() => setShowComplete(true)}>
            Finish Workout
          </Button>
        </div>
      </div>
    );
  }

  const currentBlock = template.blocks[currentBlockIndex];
  const currentExercise = currentBlock?.exercises[currentExerciseIndex];

  if (!currentBlock || !currentExercise) {
    setShowComplete(true);
  }

  // Check if workout is complete
  const isLastExercise =
    currentBlockIndex === template.blocks.length - 1 &&
    currentExerciseIndex === currentBlock?.exercises.length - 1;

  // Calculate total progress
  const totalExercises = template.blocks.reduce((acc, b) => acc + b.exercises.length, 0);
  const completedExercises = session.exercises.length;
  const progressPercent = Math.round((completedExercises / totalExercises) * 100);

  // Get effective exercise ID (after swaps)
  const swapKey = `${currentBlockIndex}-${currentExerciseIndex}`;
  const effectiveExerciseId = swappedExercises[swapKey] || currentExercise?.exerciseId;
  const effectiveExercise = currentExercise
    ? { ...currentExercise, exerciseId: effectiveExerciseId }
    : null;

  const handleComplete = (log: Parameters<typeof onLogExercise>[0]) => {
    onLogExercise(log);
    if (isLastExercise) {
      setShowComplete(true);
    } else {
      onNextExercise(currentBlock.exercises.length, template.blocks.length);
    }
  };

  const handleSkip = () => {
    if (isLastExercise) {
      setShowComplete(true);
    } else {
      onNextExercise(currentBlock.exercises.length, template.blocks.length);
    }
  };

  const handleSwap = (newExerciseId: string) => {
    setSwappedExercises(prev => ({
      ...prev,
      [swapKey]: newExerciseId,
    }));
  };

  const handleFinishWorkout = () => {
    onCompleteWorkout(finalEffort);
  };

  // Completion screen
  if (showComplete) {
    const duration = Math.round((Date.now() - new Date(session.startedAt).getTime()) / 1000 / 60);

    return (
      <div className="min-h-screen flex flex-col px-4 pt-12 pb-24 safe-top">
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-emerald-600/20 flex items-center justify-center">
            <svg className="w-12 h-12 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-slate-100 mb-2">Workout Complete!</h2>
          <p className="text-slate-400 mb-8">
            {duration} min • {session.exercises.length} exercises
          </p>

          <div className="w-full max-w-sm">
            <label className="block text-sm text-slate-400 mb-3 text-left">
              How was your overall effort?
            </label>
            <EffortPicker value={finalEffort} onChange={setFinalEffort} />
          </div>
        </div>

        <div className="mt-8">
          <Button variant="primary" size="lg" onClick={handleFinishWorkout} className="w-full">
            Save Workout
          </Button>
        </div>
      </div>
    );
  }

  // Cancel confirmation
  if (showCancelConfirm) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 pb-24">
        <div className="text-center max-w-sm">
          <h2 className="text-xl font-semibold text-slate-200 mb-2">Cancel Workout?</h2>
          <p className="text-slate-400 mb-6">
            Your progress ({session.exercises.length} exercises) will be lost.
          </p>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setShowCancelConfirm(false)} className="flex-1">
              Keep Going
            </Button>
            <Button variant="danger" onClick={onCancelWorkout} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col pb-20">
      {/* Progress Bar */}
      <div className="h-1 bg-slate-800">
        <div
          className="h-full bg-emerald-500 transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Top Actions */}
      <div className="flex justify-between items-center px-4 py-2 safe-top">
        <button
          onClick={() => setShowCancelConfirm(true)}
          className="p-2 text-slate-400 hover:text-slate-200"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="text-sm text-slate-400">
          {progressPercent}% complete
        </div>
        <button
          onClick={() => setShowComplete(true)}
          className="p-2 text-emerald-400 hover:text-emerald-300 text-sm font-medium"
        >
          Finish
        </button>
      </div>

      {/* Exercise View */}
      {effectiveExercise && (
        <ExerciseView
          workoutExercise={effectiveExercise}
          blockName={currentBlock.name}
          exerciseNumber={currentExerciseIndex + 1}
          totalExercises={currentBlock.exercises.length}
          onComplete={handleComplete}
          onSkip={handleSkip}
          onSwapExercise={handleSwap}
        />
      )}
    </div>
  );
}
