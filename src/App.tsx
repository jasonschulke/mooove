import { useState, useEffect } from 'react';
import type { WorkoutTemplate } from './types';
import { useWorkout } from './hooks/useWorkout';
import { NavBar } from './components/NavBar';
import { HomePage } from './pages/HomePage';
import { WorkoutPage } from './pages/WorkoutPage';
import { ExercisesPage } from './pages/ExercisesPage';

type Page = 'home' | 'workout' | 'exercises';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const workout = useWorkout();

  // Navigate to workout page when starting a workout
  useEffect(() => {
    if (workout.session && currentPage === 'home') {
      setCurrentPage('workout');
    }
  }, [workout.session]);

  const handleStartWorkout = (template: WorkoutTemplate) => {
    workout.startWorkout(template);
    setCurrentPage('workout');
  };

  const handleQuickStart = () => {
    workout.startQuickWorkout('Quick Workout');
    setCurrentPage('workout');
  };

  const handleCompleteWorkout = (effort?: number) => {
    workout.completeWorkout(effort as any);
    setCurrentPage('home');
  };

  const handleCancelWorkout = () => {
    workout.cancelWorkout();
    setCurrentPage('home');
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {currentPage === 'home' && (
        <HomePage
          onStartWorkout={handleStartWorkout}
          onQuickStart={handleQuickStart}
        />
      )}

      {currentPage === 'workout' && (
        <WorkoutPage
          session={workout.session}
          currentBlockIndex={workout.currentBlockIndex}
          currentExerciseIndex={workout.currentExerciseIndex}
          onLogExercise={workout.logExercise}
          onNextExercise={workout.nextExercise}
          onPreviousExercise={workout.previousExercise}
          onCompleteWorkout={handleCompleteWorkout}
          onCancelWorkout={handleCancelWorkout}
          onStartQuickWorkout={handleQuickStart}
        />
      )}

      {currentPage === 'exercises' && <ExercisesPage />}

      <NavBar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        hasActiveWorkout={!!workout.session}
      />
    </div>
  );
}

export default App;
