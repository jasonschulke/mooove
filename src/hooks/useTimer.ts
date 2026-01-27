import { useState, useEffect, useCallback, useRef } from 'react';

export function useTimer(initialSeconds = 0) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [isCountdown, setIsCountdown] = useState(false);
  const intervalRef = useRef<number | null>(null);

  const clear = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    return clear;
  }, [clear]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = window.setInterval(() => {
        setSeconds(prev => {
          if (isCountdown) {
            if (prev <= 1) {
              setIsRunning(false);
              return 0;
            }
            return prev - 1;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      clear();
    }

    return clear;
  }, [isRunning, isCountdown, clear]);

  const start = useCallback(() => {
    setIsRunning(true);
  }, []);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const toggle = useCallback(() => {
    setIsRunning(prev => !prev);
  }, []);

  const reset = useCallback((newSeconds = 0) => {
    setSeconds(newSeconds);
    setIsRunning(false);
  }, []);

  const startCountdown = useCallback((duration: number) => {
    setSeconds(duration);
    setIsCountdown(true);
    setIsRunning(true);
  }, []);

  const startStopwatch = useCallback(() => {
    setSeconds(0);
    setIsCountdown(false);
    setIsRunning(true);
  }, []);

  const formatTime = useCallback((secs: number = seconds) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs.toString().padStart(2, '0')}`;
  }, [seconds]);

  return {
    seconds,
    isRunning,
    isCountdown,
    start,
    pause,
    toggle,
    reset,
    startCountdown,
    startStopwatch,
    formatTime,
  };
}
