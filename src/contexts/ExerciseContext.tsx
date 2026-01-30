import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';
import type { Exercise } from '../types';
import { defaultExercises } from '../data/exercises';
import { loadCustomExercises, saveCustomExercises } from '../data/storage';

interface ExerciseContextType {
  /** All exercises (default + custom) */
  exercises: Exercise[];
  /** Only custom exercises */
  customExercises: Exercise[];
  /** Add a new custom exercise */
  addExercise: (exercise: Omit<Exercise, 'id'>) => Exercise;
  /** Update an existing custom exercise */
  updateExercise: (id: string, updates: Partial<Omit<Exercise, 'id'>>) => Exercise | null;
  /** Delete a custom exercise */
  deleteExercise: (id: string) => void;
  /** Force refresh from storage */
  refreshExercises: () => void;
  /** Get exercise by ID */
  getExerciseById: (id: string) => Exercise | undefined;
}

const ExerciseContext = createContext<ExerciseContextType | undefined>(undefined);

export function ExerciseProvider({ children }: { children: ReactNode }) {
  const [customExercises, setCustomExercises] = useState<Exercise[]>(() =>
    loadCustomExercises()
  );

  // Combine default and custom exercises
  const exercises = useMemo(
    () => [...defaultExercises, ...customExercises],
    [customExercises]
  );

  const addExercise = useCallback((exercise: Omit<Exercise, 'id'>): Exercise => {
    const newExercise: Exercise = {
      ...exercise,
      id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    setCustomExercises(prev => {
      const updated = [...prev, newExercise];
      saveCustomExercises(updated);
      return updated;
    });
    return newExercise;
  }, []);

  const updateExercise = useCallback((id: string, updates: Partial<Omit<Exercise, 'id'>>): Exercise | null => {
    let updatedExercise: Exercise | null = null;
    setCustomExercises(prev => {
      const index = prev.findIndex(e => e.id === id);
      if (index === -1) return prev;

      updatedExercise = { ...prev[index], ...updates };
      const updated = [...prev];
      updated[index] = updatedExercise;
      saveCustomExercises(updated);
      return updated;
    });
    return updatedExercise;
  }, []);

  const deleteExercise = useCallback((id: string): void => {
    setCustomExercises(prev => {
      const updated = prev.filter(e => e.id !== id);
      saveCustomExercises(updated);
      return updated;
    });
  }, []);

  const refreshExercises = useCallback((): void => {
    setCustomExercises(loadCustomExercises());
  }, []);

  const getExerciseById = useCallback((id: string): Exercise | undefined => {
    return exercises.find(e => e.id === id);
  }, [exercises]);

  const value: ExerciseContextType = {
    exercises,
    customExercises,
    addExercise,
    updateExercise,
    deleteExercise,
    refreshExercises,
    getExerciseById,
  };

  return <ExerciseContext.Provider value={value}>{children}</ExerciseContext.Provider>;
}

export function useExercises() {
  const context = useContext(ExerciseContext);
  if (context === undefined) {
    throw new Error('useExercises must be used within an ExerciseProvider');
  }
  return context;
}
