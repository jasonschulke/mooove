import { useEffect, useState, useMemo, useCallback } from 'react';
import { getWorkoutStats, getThisWeekWorkoutDates, getYearlyContributions, loadRestDays, toggleYearDayStatus, hasWorkoutOnDate, hasRealWorkoutOnDate, addBacklogWorkout, getEffortHistory, backfillEffortScores, loadUserName, loadPersonality, getMostSkippedExercises, getSessionsByDate, getMostUsedExercises } from '../data/storage';
import { EffortChart } from '../components/EffortChart';
import { getExerciseById } from '../data/exercises';
import type { PersonalityType, WorkoutSession } from '../types';

function getTimeBasedGreeting(name: string | null, personality: PersonalityType): string {
  const hour = new Date().getHours();
  const displayName = name || 'there';
  const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';

  const greetings: Record<PersonalityType, Record<string, string[]>> = {
    neutral: {
      morning: [`Mornin', ${displayName}.`, `Good morning, ${displayName}.`],
      afternoon: [`Afternoon, ${displayName}.`, `Good afternoon, ${displayName}.`],
      evening: [`Evenin', ${displayName}.`, `Good evening, ${displayName}.`],
    },
    sarcastic: {
      morning: [`Oh look who finally woke up, ${displayName}.`, `Rise and grind, ${displayName}. Or just rise, whatever.`],
      afternoon: [`Afternoon, ${displayName}. Missing morning workouts again?`, `Well well, ${displayName} decided to show up.`],
      evening: [`Evening workout? Bold choice, ${displayName}.`, `Late night gains, ${displayName}? Respect.`],
    },
    encouraging: {
      morning: [`Good morning, ${displayName}! Today is YOUR day!`, `Rise and shine, ${displayName}! You've got this!`],
      afternoon: [`Hey ${displayName}! Keep that momentum going!`, `Afternoon, ${displayName}! You're doing amazing!`],
      evening: [`Evening, ${displayName}! Great job showing up today!`, `Hey ${displayName}! Finishing the day strong!`],
    },
    'drill-sergeant': {
      morning: [`DROP AND GIVE ME 20, ${displayName.toUpperCase()}!`, `RISE AND GRIND, ${displayName.toUpperCase()}! NO EXCUSES!`],
      afternoon: [`${displayName.toUpperCase()}! TIME TO PUT IN WORK!`, `AFTERNOON MEANS NOTHING! WORK HARDER, ${displayName.toUpperCase()}!`],
      evening: [`LAST CHANCE TODAY, ${displayName.toUpperCase()}! MAKE IT COUNT!`, `EVENING WARRIOR ${displayName.toUpperCase()} REPORTING FOR DUTY!`],
    },
    zen: {
      morning: [`Breathe in the morning energy, ${displayName}.`, `A peaceful morning awaits you, ${displayName}.`],
      afternoon: [`Center yourself this afternoon, ${displayName}.`, `The afternoon brings balance, ${displayName}.`],
      evening: [`Find your evening calm, ${displayName}.`, `As the day ends, strength begins, ${displayName}.`],
    },
    trump: {
      morning: [`Good morning, ${displayName}! Today's workout? HUGE. The best.`, `Rise and shine, ${displayName}! Nobody - and I mean NOBODY - works out like you!`, `${displayName}! Ready to make these gains GREAT AGAIN?`],
      afternoon: [`${displayName}, you're doing tremendous work! Tremendous!`, `Believe me, ${displayName}, this workout will be FANTASTIC. People are saying it!`, `Afternoon, ${displayName}! Your muscles? Very impressive. Everyone's talking about them.`],
      evening: [`Evening, ${displayName}! We're gonna finish BIGLY!`, `${displayName}, your evening workout will be the greatest workout in the history of workouts, maybe ever!`, `Look, ${displayName}, I know workouts. And yours? Incredible. Just incredible.`],
    },
  };

  const options = greetings[personality][timeOfDay];
  return options[Math.floor(Math.random() * options.length)];
}

export function HomePage() {
  const [stats, setStats] = useState(() => getWorkoutStats());
  const [, setThisWeekDates] = useState(() => getThisWeekWorkoutDates());
  const [yearlyData, setYearlyData] = useState(() => getYearlyContributions());
  const [restDays, setRestDays] = useState(() => loadRestDays());
  const [effortHistory, setEffortHistory] = useState(() => getEffortHistory());
  const [userName] = useState(() => loadUserName());
  const [personality] = useState(() => loadPersonality());
  const [mostSkipped, setMostSkipped] = useState(() => getMostSkippedExercises(5));
  const [mostUsedExercises, setMostUsedExercises] = useState(() => getMostUsedExercises(5));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedDateWorkouts, setSelectedDateWorkouts] = useState<WorkoutSession[]>([]);
  const [exerciseTab, setExerciseTab] = useState<'used' | 'skipped'>('used');
  const greeting = getTimeBasedGreeting(userName, personality);

  // Get current date string for memo dependencies (ensures calendar updates daily)
  const currentDateStr = new Date().toLocaleDateString();

  useEffect(() => {
    // Add backlog workouts for specified dates (only if not already present)
    const backlogDates = ['2026-01-06', '2026-01-07', '2026-01-20', '2026-01-21', '2026-01-23', '2026-01-24'];
    backlogDates.forEach(dateStr => {
      if (!hasWorkoutOnDate(dateStr)) {
        addBacklogWorkout(dateStr);
      }
    });

    // Backfill effort scores for workouts that don't have them
    backfillEffortScores();

    setStats(getWorkoutStats());
    setThisWeekDates(getThisWeekWorkoutDates());
    setYearlyData(getYearlyContributions());
    setRestDays(loadRestDays());
    setEffortHistory(getEffortHistory());
    setMostSkipped(getMostSkippedExercises(5));
    setMostUsedExercises(getMostUsedExercises(5));
  }, []);

  // Handle clicking on a date to view workout details
  const handleDateClick = useCallback((dateStr: string) => {
    const sessions = getSessionsByDate(dateStr);
    if (sessions.length > 0) {
      setSelectedDate(dateStr);
      setSelectedDateWorkouts(sessions);
    }
  }, []);

  const handleToggleYearDay = useCallback((dateStr: string) => {
    // Perform the storage update first
    const result = toggleYearDayStatus(dateStr);

    // If protected, don't update UI
    if (result === 'protected') {
      return;
    }

    // Re-fetch from storage to ensure consistency
    setYearlyData(getYearlyContributions());
    setRestDays(loadRestDays());
    setStats(getWorkoutStats());
    setThisWeekDates(getThisWeekWorkoutDates());
  }, []);


  // This Month calendar grid
  const monthCalendar = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    // Get the day of week the month starts on (0 = Sunday)
    const startDayOfWeek = firstDay.getDay();
    // Adjust for Monday start
    const mondayAdjustedStart = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

    const weeks: { days: { date: Date | null; dateStr: string; hasWorkout: boolean; isRest: boolean; isToday: boolean; isPast: boolean }[]; isCurrentWeek: boolean }[] = [];
    let currentWeekDays: { date: Date | null; dateStr: string; hasWorkout: boolean; isRest: boolean; isToday: boolean; isPast: boolean }[] = [];
    let weekContainsToday = false;
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Add empty cells for days before the month starts
    for (let i = 0; i < mondayAdjustedStart; i++) {
      currentWeekDays.push({ date: null, dateStr: '', hasWorkout: false, isRest: false, isToday: false, isPast: false });
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split('T')[0];
      const isToday = day === now.getDate() && month === now.getMonth() && year === now.getFullYear();
      const isPast = date < today;

      if (isToday) weekContainsToday = true;

      currentWeekDays.push({
        date,
        dateStr,
        hasWorkout: (yearlyData.get(dateStr) || 0) > 0,
        isRest: restDays.has(dateStr),
        isToday,
        isPast,
      });

      if (currentWeekDays.length === 7) {
        weeks.push({ days: currentWeekDays, isCurrentWeek: weekContainsToday });
        currentWeekDays = [];
        weekContainsToday = false;
      }
    }

    // Fill remaining days in last week
    if (currentWeekDays.length > 0) {
      while (currentWeekDays.length < 7) {
        currentWeekDays.push({ date: null, dateStr: '', hasWorkout: false, isRest: false, isToday: false, isPast: false });
      }
      weeks.push({ days: currentWeekDays, isCurrentWeek: weekContainsToday });
    }

    // Format today's date as "Weekday, Month Day"
    const todayFormatted = now.toLocaleString('default', { weekday: 'long', month: 'long', day: 'numeric' });

    return {
      weeks,
      monthName: firstDay.toLocaleString('default', { month: 'long', year: 'numeric' }),
      todayFormatted,
    };
  }, [yearlyData, restDays, currentDateStr]);

  // Year contribution grid starting from Jan 1, 2026
  const { contributionGrid, monthLabels, currentWeekIndex } = useMemo(() => {
    const startDate = new Date(2026, 0, 1); // Jan 1, 2026
    const endDate = new Date(2026, 11, 31); // Dec 31, 2026
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weeks: { date: string; hasWorkout: boolean; isRest: boolean; isPast: boolean }[][] = [];
    let currentWeek: { date: string; hasWorkout: boolean; isRest: boolean; isPast: boolean }[] = [];
    const labels: { weekIndex: number; label: string }[] = [];
    let foundCurrentWeekIdx = -1;

    // Start from the Monday of the week containing Jan 1
    const firstDay = startDate.getDay();
    const mondayOffset = firstDay === 0 ? -6 : 1 - firstDay;
    const gridStart = new Date(startDate);
    gridStart.setDate(startDate.getDate() + mondayOffset);

    let currentMonth = -1;
    let currentDate = new Date(gridStart);
    let weekContainsToday = false;

    while (currentDate <= endDate || currentWeek.length > 0) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const isInYear = currentDate >= startDate && currentDate <= endDate;
      const month = currentDate.getMonth();
      const isPast = currentDate < today;

      // Check if this day is today
      if (currentDate.toDateString() === now.toDateString()) {
        weekContainsToday = true;
      }

      // Track month changes for labels
      if (isInYear && month !== currentMonth && currentWeek.length === 0) {
        labels.push({
          weekIndex: weeks.length,
          label: currentDate.toLocaleString('default', { month: 'short' }),
        });
        currentMonth = month;
      }

      currentWeek.push({
        date: isInYear ? dateStr : '',
        hasWorkout: isInYear ? (yearlyData.get(dateStr) || 0) > 0 : false,
        isRest: isInYear ? restDays.has(dateStr) : false,
        isPast: isInYear ? isPast : false,
      });

      if (currentWeek.length === 7) {
        if (weekContainsToday) {
          foundCurrentWeekIdx = weeks.length;
        }
        weeks.push(currentWeek);
        currentWeek = [];
        weekContainsToday = false;
      }

      currentDate.setDate(currentDate.getDate() + 1);

      // Stop after completing the year
      if (currentDate > endDate && currentWeek.length === 0) break;
    }

    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push({ date: '', hasWorkout: false, isRest: false, isPast: false });
      }
      if (weekContainsToday) {
        foundCurrentWeekIdx = weeks.length;
      }
      weeks.push(currentWeek);
    }

    return { contributionGrid: weeks, monthLabels: labels, currentWeekIndex: foundCurrentWeekIdx };
  }, [yearlyData, restDays, currentDateStr]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    return `${mins} min`;
  };

  // Find favorite workout day
  const favoriteDay = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const maxDay = Object.entries(stats.workoutsByDay).reduce(
      (max, [day, count]) => (count > max.count ? { day: parseInt(day), count } : max),
      { day: -1, count: 0 }
    );
    return maxDay.count > 0 ? days[maxDay.day] : '--';
  }, [stats.workoutsByDay]);

  const handleRefresh = () => {
    // Clear onboarding flag and user name to trigger onboarding again
    // but keep all workout data intact
    localStorage.removeItem('workout_onboarding_complete');
    localStorage.removeItem('workout_user_name');
    window.location.reload();
  };


  // Workout details modal
  if (selectedDate && selectedDateWorkouts.length > 0) {
    const dateDisplay = new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    return (
      <div className="min-h-screen pb-24 bg-slate-100 dark:bg-slate-950">
        <header className="px-4 pt-16 pb-4 safe-top">
          <button
            onClick={() => { setSelectedDate(null); setSelectedDateWorkouts([]); }}
            className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Workout History</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{dateDisplay}</p>
        </header>

        <div className="px-4 space-y-4">
          {selectedDateWorkouts.map(session => (
            <div
              key={session.id}
              className="p-4 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 shadow-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{session.name}</h3>
                {session.overallEffort && (
                  <span className="px-2 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm font-medium">
                    Effort: {session.overallEffort}/10
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mb-4">
                <span>{session.exercises.length} exercises</span>
                {session.totalDuration && (
                  <span>{Math.round(session.totalDuration / 60)} min</span>
                )}
              </div>

              {/* Exercise list */}
              {session.exercises.length > 0 && (
                <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
                  <h4 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Exercises</h4>
                  <div className="space-y-2">
                    {session.exercises.map((log, idx) => {
                      const exercise = getExerciseById(log.exerciseId);
                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between py-2 px-3 rounded-lg bg-slate-50 dark:bg-slate-900/50"
                        >
                          <span className="text-sm text-slate-700 dark:text-slate-300">
                            {exercise?.name || log.exerciseId}
                          </span>
                          <span className="text-sm text-slate-500 dark:text-slate-400 tabular-nums">
                            {log.weight && `${log.weight}lb`}
                            {log.weight && log.reps && ' × '}
                            {log.reps && `${log.reps}`}
                            {log.duration && `${log.duration}s`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Blocks summary */}
              {session.blocks && session.blocks.length > 0 && (
                <div className="border-t border-slate-200 dark:border-slate-700 pt-3 mt-3">
                  <h4 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Workout Structure</h4>
                  <div className="flex flex-wrap gap-2">
                    {session.blocks.map((block, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                      >
                        {block.name} ({block.exercises.length})
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 bg-slate-100 dark:bg-slate-950">
      {/* Header */}
      <header className="safe-top pt-12">
        <div className="px-4 pb-4">
          {/* Top row: Logo + title | Buttons */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <img src="/logo_icon.png" alt="Moove" className="h-9 dark:invert" />
              <img src="/moove.svg" alt="Moove" className="h-5 dark:invert" />
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleRefresh} className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800/50 border border-slate-300/50 dark:border-slate-600/50 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>

          {/* Full-width greeting */}
          <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">{greeting}</p>
        </div>
      </header>

      {/* This Month Calendar */}
      <section className="px-4 mb-6 mt-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">This Month</h2>
          {stats.currentStreak > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-base">🔥</span>
              <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                {stats.currentStreak} day{stats.currentStreak !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="text-sm text-slate-500 dark:text-slate-400 mb-3 text-center">{monthCalendar.todayFormatted}</div>
          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
              <div key={i} className="flex justify-center text-xs text-slate-400 dark:text-slate-500 font-medium">
                {day}
              </div>
            ))}
          </div>
          {/* Calendar grid */}
          <div className="space-y-1">
            {monthCalendar.weeks.map((week, weekIdx) => (
              <div
                key={weekIdx}
                className={`grid grid-cols-7 py-1 -mx-2 px-2 rounded-lg transition-colors ${
                  week.isCurrentWeek
                    ? 'bg-emerald-100 dark:bg-emerald-900/40'
                    : ''
                }`}
              >
                {week.days.map((day, dayIdx) => {
                  const hasRealWorkout = day.dateStr ? hasRealWorkoutOnDate(day.dateStr) : false;
                  return (
                    <div key={dayIdx} className="flex justify-center">
                      <button
                        onClick={() => {
                          if (!day.dateStr) return;
                          if (hasRealWorkout) {
                            handleDateClick(day.dateStr);
                          } else {
                            handleToggleYearDay(day.dateStr);
                          }
                        }}
                        disabled={!day.date}
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                          !day.date
                            ? 'bg-transparent'
                            : day.hasWorkout
                            ? hasRealWorkout
                              ? `bg-emerald-600 text-white ring-2 ring-emerald-300 dark:ring-emerald-700 ${day.isPast ? 'opacity-60' : ''}`
                              : `bg-emerald-500 text-white ${day.isPast ? 'opacity-60' : ''}`
                            : day.isRest
                            ? `bg-purple-400 dark:bg-purple-500 text-white ${day.isPast ? 'opacity-60' : ''}`
                            : day.isToday
                            ? 'border-2 border-dashed border-emerald-500 text-slate-700 dark:text-slate-300'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                        } ${day.isToday && day.date ? 'ring-2 ring-offset-2 ring-emerald-500 dark:ring-offset-slate-800' : ''}`}
                        title={hasRealWorkout ? 'Tap to view workout details' : ''}
                      >
                        {day.date?.getDate()}
                      </button>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          {/* Legend */}
          <div className="flex items-center justify-center gap-4 mt-3 text-[10px] text-slate-400 dark:text-slate-500">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span>Workout</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-purple-400 dark:bg-purple-500" />
              <span>Rest</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-6 h-3 rounded bg-emerald-100 dark:bg-emerald-900/40" />
              <span>This week</span>
            </div>
          </div>
        </div>
      </section>

      {/* Yearly Contribution Grid */}
      <section className="px-4 mb-6">
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">This Year</h2>
          <span className="text-xs text-slate-500">Year Overview</span>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm overflow-x-auto scrollbar-hide">
          <div className="min-w-max">
            {/* Month labels row */}
            <div className="flex gap-[3px] mb-2 h-4">
              {contributionGrid.map((_, weekIndex) => {
                const label = monthLabels.find(m => m.weekIndex === weekIndex);
                return (
                  <div key={weekIndex} className="w-[11px] flex-shrink-0">
                    {label && (
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {label.label}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            {/* Grid */}
            <div className="flex gap-[3px]">
              {contributionGrid.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col items-center">
                  <div className="flex flex-col gap-[3px]">
                    {week.map((day, dayIndex) => (
                      <button
                        type="button"
                        key={`${weekIndex}-${dayIndex}`}
                        onClick={() => day.date && handleToggleYearDay(day.date)}
                        disabled={!day.date}
                        className={`w-[11px] h-[11px] rounded-[2px] transition-colors touch-manipulation ${
                          !day.date
                            ? 'bg-transparent cursor-default'
                            : day.hasWorkout
                            ? `bg-emerald-500 hover:bg-emerald-400 cursor-pointer ${day.isPast ? 'opacity-60' : ''}`
                            : day.isRest
                            ? `bg-purple-400 hover:bg-purple-300 dark:bg-purple-500 dark:hover:bg-purple-400 cursor-pointer ${day.isPast ? 'opacity-60' : ''}`
                            : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 cursor-pointer'
                        }`}
                        title={day.date ? `${day.date}: ${day.hasWorkout ? 'Worked out' : day.isRest ? 'Rest day' : 'No workout'} (tap to change)` : ''}
                      />
                    ))}
                  </div>
                  {/* Current week indicator dot */}
                  {weekIndex === currentWeekIndex && (
                    <div className="w-[5px] h-[5px] rounded-full bg-emerald-500 mt-1.5" />
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 mt-3 text-xs text-slate-500">
            <div className="w-[11px] h-[11px] rounded-[2px] bg-emerald-500" />
            <span>Workout</span>
            <div className="w-[11px] h-[11px] rounded-[2px] bg-purple-400 dark:bg-purple-500 ml-2" />
            <span>Rest</span>
            <div className="w-[5px] h-[5px] rounded-full bg-emerald-500 ml-2" />
            <span>This week</span>
          </div>
        </div>
      </section>

      {/* Effort Chart */}
      <section className="px-4 mb-6">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">Effort Trend</h2>
        <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
          <EffortChart data={effortHistory} />
        </div>
      </section>

      {/* Quick Stats - 2 rows */}
      <section className="px-4 mb-6">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">Stats</h2>
        <div className="grid grid-cols-3 gap-3 mb-3">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.thisWeek}</div>
            <div className="text-sm text-slate-500 dark:text-slate-400">This week</div>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.thisMonth}</div>
            <div className="text-sm text-slate-500 dark:text-slate-400">This month</div>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.totalWorkouts}</div>
            <div className="text-sm text-slate-500 dark:text-slate-400">Total</div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {stats.avgDuration > 0 ? formatDuration(stats.avgDuration) : '--'}
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400">Avg time</div>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.longestStreak}</div>
            <div className="text-sm text-slate-500 dark:text-slate-400">Best streak</div>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{favoriteDay}</div>
            <div className="text-sm text-slate-500 dark:text-slate-400">Top day</div>
          </div>
        </div>
      </section>

      {/* Insights - Tabbed card for Most Used / Most Skipped */}
      {(mostUsedExercises.length > 0 || mostSkipped.length > 0) && (
        <section className="px-4 mb-6">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">Insights</h2>
          <div className="rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            {/* Tab buttons - pill style matching Library */}
            <div className="p-3 pb-0">
              <div className="flex rounded-xl bg-slate-200 dark:bg-slate-700 p-1">
                <button
                  onClick={() => setExerciseTab('used')}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    exerciseTab === 'used'
                      ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-slate-100 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Most Used
                </button>
                <button
                  onClick={() => setExerciseTab('skipped')}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    exerciseTab === 'skipped'
                      ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-slate-100 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Most Skipped
                </button>
              </div>
            </div>
            {/* Tab content */}
            <div className="p-4">
              {exerciseTab === 'used' && mostUsedExercises.length > 0 && (
                <div className="space-y-2">
                  {mostUsedExercises.map((item, idx) => {
                    const exercise = getExerciseById(item.exerciseId);
                    if (!exercise) return null;
                    return (
                      <div key={item.exerciseId} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700 last:border-0">
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-slate-400 dark:text-slate-500 w-4">{idx + 1}.</span>
                          <span className="text-sm text-slate-700 dark:text-slate-300">{exercise.name}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs">
                          {item.count}x
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
              {exerciseTab === 'used' && mostUsedExercises.length === 0 && (
                <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-4">No exercise data yet</p>
              )}
              {exerciseTab === 'skipped' && mostSkipped.length > 0 && (
                <div className="space-y-2">
                  {mostSkipped.map((item, idx) => {
                    const exercise = getExerciseById(item.exerciseId);
                    if (!exercise) return null;
                    return (
                      <div key={item.exerciseId} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700 last:border-0">
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-slate-400 dark:text-slate-500 w-4">{idx + 1}.</span>
                          <span className="text-sm text-slate-700 dark:text-slate-300">{exercise.name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          {item.skips > 0 && (
                            <span className="px-2 py-0.5 rounded bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                              {item.skips} skipped
                            </span>
                          )}
                          {item.swaps > 0 && (
                            <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                              {item.swaps} swapped
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                    Consider removing or replacing these exercises
                  </p>
                </div>
              )}
              {exerciseTab === 'skipped' && mostSkipped.length === 0 && (
                <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-4">No skipped exercises</p>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
