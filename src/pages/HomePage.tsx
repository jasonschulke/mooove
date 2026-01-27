import { useEffect, useState } from 'react';
import type { WorkoutTemplate } from '../types';
import { workoutTemplates } from '../data/workouts';
import { getWorkoutStats } from '../data/storage';
import { Button } from '../components/Button';

interface HomePageProps {
  onStartWorkout: (template: WorkoutTemplate) => void;
  onQuickStart: () => void;
}

export function HomePage({ onStartWorkout, onQuickStart }: HomePageProps) {
  const [stats, setStats] = useState(() => getWorkoutStats());

  useEffect(() => {
    setStats(getWorkoutStats());
  }, []);

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date().getDay();

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    return `${mins} min`;
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="px-4 pt-12 pb-6 safe-top">
        <h1 className="text-3xl font-bold text-slate-100">Workout</h1>
        <p className="text-slate-400 mt-1">Let's get moving</p>
      </header>

      {/* Quick Stats */}
      <section className="px-4 mb-6">
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-600/20 to-emerald-600/5 border border-emerald-600/20">
            <div className="text-3xl font-bold text-emerald-400">{stats.currentStreak}</div>
            <div className="text-sm text-slate-400">Day streak</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700">
            <div className="text-3xl font-bold text-slate-100">{stats.thisWeek}</div>
            <div className="text-sm text-slate-400">This week</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700">
            <div className="text-3xl font-bold text-slate-100">{stats.totalWorkouts}</div>
            <div className="text-sm text-slate-400">Total workouts</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700">
            <div className="text-3xl font-bold text-slate-100">
              {stats.avgDuration > 0 ? formatDuration(stats.avgDuration) : '--'}
            </div>
            <div className="text-sm text-slate-400">Avg duration</div>
          </div>
        </div>
      </section>

      {/* Weekly Activity */}
      <section className="px-4 mb-8">
        <h2 className="text-lg font-semibold text-slate-200 mb-3">This Week</h2>
        <div className="flex justify-between gap-2">
          {dayNames.map((day, i) => {
            const count = stats.workoutsByDay[i] || 0;
            const isToday = i === today;
            return (
              <div key={day} className="flex-1 text-center">
                <div
                  className={`h-12 rounded-lg mb-1 flex items-end justify-center ${
                    count > 0
                      ? 'bg-emerald-600'
                      : isToday
                      ? 'bg-slate-700 border-2 border-dashed border-slate-600'
                      : 'bg-slate-800'
                  }`}
                >
                  {count > 0 && (
                    <span className="text-xs text-white font-medium mb-1">{count}</span>
                  )}
                </div>
                <span className={`text-xs ${isToday ? 'text-emerald-400 font-medium' : 'text-slate-500'}`}>
                  {day}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Start Workout */}
      <section className="px-4 mb-6">
        <h2 className="text-lg font-semibold text-slate-200 mb-3">Start Workout</h2>

        <Button
          variant="primary"
          size="lg"
          onClick={onQuickStart}
          className="w-full mb-4"
        >
          Quick Start
        </Button>

        <div className="space-y-3">
          {workoutTemplates.map(template => (
            <button
              key={template.id}
              onClick={() => onStartWorkout(template)}
              className="w-full p-4 rounded-xl bg-slate-800/50 border border-slate-700 text-left hover:bg-slate-800 transition-colors active:scale-[0.98]"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold text-slate-100">{template.name}</div>
                  <div className="text-sm text-slate-400 mt-1">
                    {template.blocks.length} blocks •{' '}
                    {template.blocks.reduce((acc, b) => acc + b.exercises.length, 0)} exercises
                  </div>
                </div>
                <svg className="w-5 h-5 text-slate-500 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Longest Streak */}
      {stats.longestStreak > 0 && (
        <section className="px-4 mb-6">
          <div className="p-4 rounded-xl bg-amber-600/10 border border-amber-600/20">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🔥</span>
              <div>
                <div className="font-medium text-amber-400">Longest streak: {stats.longestStreak} days</div>
                <div className="text-sm text-slate-400">Keep pushing!</div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
