interface NavBarProps {
  currentPage: 'home' | 'workout' | 'exercises';
  onNavigate: (page: 'home' | 'workout' | 'exercises') => void;
  hasActiveWorkout: boolean;
}

export function NavBar({ currentPage, onNavigate, hasActiveWorkout }: NavBarProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur border-t border-slate-800 safe-bottom">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        <button
          onClick={() => onNavigate('home')}
          className={`flex flex-col items-center gap-1 px-6 py-2 transition-colors ${
            currentPage === 'home' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-xs">Home</span>
        </button>

        <button
          onClick={() => onNavigate('workout')}
          className={`relative flex flex-col items-center gap-1 px-6 py-2 transition-colors ${
            currentPage === 'workout' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {hasActiveWorkout && (
            <span className="absolute top-1 right-4 w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          )}
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span className="text-xs">Workout</span>
        </button>

        <button
          onClick={() => onNavigate('exercises')}
          className={`flex flex-col items-center gap-1 px-6 py-2 transition-colors ${
            currentPage === 'exercises' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <span className="text-xs">Exercises</span>
        </button>
      </div>
    </nav>
  );
}
