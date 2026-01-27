import type { WorkoutSession, ExerciseLog } from '../types';

const SESSIONS_KEY = 'workout_sessions';
const CURRENT_SESSION_KEY = 'current_workout_session';

export function saveSessions(sessions: WorkoutSession[]): void {
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

export function loadSessions(): WorkoutSession[] {
  const data = localStorage.getItem(SESSIONS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveCurrentSession(session: WorkoutSession | null): void {
  if (session) {
    localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(session));
  } else {
    localStorage.removeItem(CURRENT_SESSION_KEY);
  }
}

export function loadCurrentSession(): WorkoutSession | null {
  const data = localStorage.getItem(CURRENT_SESSION_KEY);
  return data ? JSON.parse(data) : null;
}

export function addCompletedSession(session: WorkoutSession): void {
  const sessions = loadSessions();
  sessions.unshift(session);
  saveSessions(sessions);
  saveCurrentSession(null);
}

export function getExerciseHistory(exerciseId: string, limit = 10): ExerciseLog[] {
  const sessions = loadSessions();
  const history: ExerciseLog[] = [];

  for (const session of sessions) {
    for (const log of session.exercises) {
      if (log.exerciseId === exerciseId) {
        history.push(log);
        if (history.length >= limit) return history;
      }
    }
  }

  return history;
}

export function getLastWeekAverages(exerciseId: string): { avgWeight: number; avgReps: number } | null {
  const sessions = loadSessions();
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const recentLogs = sessions
    .filter(s => new Date(s.startedAt) >= oneWeekAgo)
    .flatMap(s => s.exercises)
    .filter(e => e.exerciseId === exerciseId);

  if (recentLogs.length === 0) return null;

  const weights = recentLogs.filter(l => l.weight).map(l => l.weight!);
  const reps = recentLogs.filter(l => typeof l.reps === 'number').map(l => l.reps as number);

  return {
    avgWeight: weights.length > 0 ? Math.round(weights.reduce((a, b) => a + b, 0) / weights.length) : 0,
    avgReps: reps.length > 0 ? Math.round(reps.reduce((a, b) => a + b, 0) / reps.length) : 0,
  };
}

export function getWorkoutStats(): {
  totalWorkouts: number;
  thisWeek: number;
  thisMonth: number;
  avgDuration: number;
  longestStreak: number;
  currentStreak: number;
  workoutsByDay: Record<number, number>;
} {
  const sessions = loadSessions().filter(s => s.completedAt);

  const now = new Date();
  const oneWeekAgo = new Date(now);
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const oneMonthAgo = new Date(now);
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  const thisWeek = sessions.filter(s => new Date(s.startedAt) >= oneWeekAgo).length;
  const thisMonth = sessions.filter(s => new Date(s.startedAt) >= oneMonthAgo).length;

  const durations = sessions
    .filter(s => s.totalDuration)
    .map(s => s.totalDuration!);
  const avgDuration = durations.length > 0
    ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
    : 0;

  // Calculate streaks
  const sortedDates = [...new Set(
    sessions.map(s => new Date(s.startedAt).toDateString())
  )].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  for (let i = 0; i < sortedDates.length; i++) {
    const date = sortedDates[i];
    const prevDate = i > 0 ? sortedDates[i - 1] : null;

    if (i === 0) {
      if (date === today || date === yesterday) {
        currentStreak = 1;
        tempStreak = 1;
      }
    } else if (prevDate) {
      const diff = new Date(prevDate).getTime() - new Date(date).getTime();
      if (diff <= 86400000 * 1.5) { // Allow for 1.5 days to handle timing variations
        tempStreak++;
        if (i < sortedDates.length && (sortedDates[0] === today || sortedDates[0] === yesterday)) {
          currentStreak = tempStreak;
        }
      } else {
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);
  }

  // Workouts by day of week (0 = Sunday)
  const workoutsByDay: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  sessions.forEach(s => {
    const day = new Date(s.startedAt).getDay();
    workoutsByDay[day]++;
  });

  return {
    totalWorkouts: sessions.length,
    thisWeek,
    thisMonth,
    avgDuration,
    longestStreak,
    currentStreak,
    workoutsByDay,
  };
}
