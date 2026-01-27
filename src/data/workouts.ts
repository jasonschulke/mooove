import type { WorkoutTemplate } from '../types';

export const workoutTemplates: WorkoutTemplate[] = [
  {
    id: 'full-body-strength',
    name: 'Full Body Strength',
    blocks: [
      {
        id: 'warmup',
        type: 'warmup',
        name: 'Warm-up',
        exercises: [
          { exerciseId: 'jumping-jacks', duration: 60 },
          { exerciseId: 'childs-pose', duration: 30 },
          { exerciseId: 'kb-dead-bugs', reps: 12, notes: 'each side' },
          { exerciseId: 'worlds-greatest-stretch', reps: 5, notes: 'each side' },
          { exerciseId: 'hollow-body-hold', duration: 30 },
          { exerciseId: 'turkish-get-ups', reps: 2, notes: 'each side' },
          { exerciseId: 'jumps', reps: 10 },
        ],
      },
      {
        id: 'strength-1',
        type: 'strength',
        name: 'Strength - Set 1',
        exercises: [
          { exerciseId: 'goblet-squat', weight: 50, reps: 10 },
          { exerciseId: 'deadlift', weight: 75, reps: 10 },
          { exerciseId: 'overhead-press' },
          { exerciseId: 'pushups' },
          { exerciseId: 'rows' },
        ],
      },
      {
        id: 'strength-2',
        type: 'strength',
        name: 'Strength - Set 2',
        exercises: [
          { exerciseId: 'bulgarian-split-squat', weight: 25, reps: 10 },
          { exerciseId: 'single-leg-hinge', weight: 50, reps: 10 },
          { exerciseId: 'overhead-press', weight: 50, reps: 8 },
          { exerciseId: 'pushups', reps: 'AMRAP' },
          { exerciseId: 'one-arm-kb-row', weight: 50, reps: 10 },
        ],
      },
      {
        id: 'strength-3',
        type: 'strength',
        name: 'Strength - Set 3',
        exercises: [
          { exerciseId: 'bulgarian-split-squat', weight: 25, reps: 10 },
          { exerciseId: 'single-leg-hinge', weight: 50, reps: 10 },
          { exerciseId: 'overhead-press', weight: 50, reps: 8 },
          { exerciseId: 'pushups', reps: 'AMRAP' },
          { exerciseId: 'one-arm-kb-row', weight: 50, reps: 10 },
        ],
      },
      {
        id: 'conditioning-1',
        type: 'conditioning',
        name: 'Conditioning - Set 1',
        exercises: [
          { exerciseId: 'kb-swing', weight: 50 },
          { exerciseId: 'planks', duration: 45 },
          { exerciseId: 'uppies', weight: 50, reps: 10 },
          { exerciseId: 'suitcase-carry', weight: 75 },
          { exerciseId: 'burpees', reps: 10 },
        ],
      },
      {
        id: 'conditioning-2',
        type: 'conditioning',
        name: 'Conditioning - Set 2',
        exercises: [
          { exerciseId: 'kb-swing', weight: 50 },
          { exerciseId: 'planks', duration: 45 },
          { exerciseId: 'uppies', weight: 50, reps: 10 },
          { exerciseId: 'suitcase-carry', weight: 75 },
          { exerciseId: 'burpees', reps: 10 },
        ],
      },
    ],
  },
];

export function getTemplateById(id: string): WorkoutTemplate | undefined {
  return workoutTemplates.find(t => t.id === id);
}
