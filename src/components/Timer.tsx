import { useEffect } from 'react';
import { useTimer } from '../hooks/useTimer';

interface TimerProps {
  duration?: number;
  onComplete?: () => void;
  enlarged?: boolean;
  autoStart?: boolean;
}

export function Timer({ duration, onComplete, enlarged = false, autoStart = false }: TimerProps) {
  const timer = useTimer();

  useEffect(() => {
    if (autoStart) {
      if (duration) {
        timer.startCountdown(duration);
      } else {
        timer.startStopwatch();
      }
    }
  }, [duration, autoStart]);

  useEffect(() => {
    if (timer.isCountdown && timer.seconds === 0 && !timer.isRunning) {
      onComplete?.();
    }
  }, [timer.seconds, timer.isRunning, timer.isCountdown, onComplete]);

  const handleToggle = () => {
    if (!timer.isRunning && timer.seconds === 0 && duration) {
      timer.startCountdown(duration);
    } else if (!timer.isRunning && timer.seconds === 0) {
      timer.startStopwatch();
    } else {
      timer.toggle();
    }
  };

  const handleReset = () => {
    timer.reset(duration || 0);
  };

  return (
    <div className={`flex flex-col items-center ${enlarged ? 'py-8' : 'py-4'}`}>
      <div
        className={`font-mono font-bold text-center transition-all ${
          enlarged
            ? 'text-7xl text-emerald-400'
            : 'text-4xl text-slate-100'
        } ${timer.isRunning ? 'animate-pulse' : ''}`}
      >
        {timer.formatTime()}
      </div>

      <div className="flex gap-3 mt-4">
        <button
          onClick={handleToggle}
          className={`w-16 h-16 rounded-full flex items-center justify-center transition-all active:scale-95 ${
            timer.isRunning
              ? 'bg-amber-600 hover:bg-amber-700'
              : 'bg-emerald-600 hover:bg-emerald-700'
          }`}
        >
          {timer.isRunning ? (
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
          )}
        </button>

        <button
          onClick={handleReset}
          className="w-16 h-16 rounded-full bg-slate-700 hover:bg-slate-600 flex items-center justify-center transition-all active:scale-95"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {timer.isCountdown && (
        <div className="mt-2 text-sm text-slate-400">
          {timer.isRunning ? 'Tap to pause' : timer.seconds === 0 ? 'Complete!' : 'Tap to resume'}
        </div>
      )}
    </div>
  );
}
