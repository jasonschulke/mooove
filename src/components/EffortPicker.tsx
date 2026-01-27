import type { EffortLevel } from '../types';

interface EffortPickerProps {
  value?: EffortLevel;
  onChange: (effort: EffortLevel | undefined) => void;
}

interface EffortCategory {
  name: string;
  levels: EffortLevel[];
  barHeight: string;
}

const EFFORT_CATEGORIES: EffortCategory[] = [
  { name: 'Easy', levels: [1, 2, 3], barHeight: 'h-20' },
  { name: 'Moderate', levels: [4, 5, 6], barHeight: 'h-28' },
  { name: 'Hard', levels: [7, 8], barHeight: 'h-36' },
  { name: 'All Out', levels: [9, 10], barHeight: 'h-44' },
];

const LEVEL_LABELS: Record<EffortLevel, string> = {
  1: 'Easy',
  2: 'Easy',
  3: 'Easy',
  4: 'Moderate',
  5: 'Moderate',
  6: 'Moderate',
  7: 'Hard',
  8: 'Hard',
  9: 'All Out',
  10: 'All Out',
};

export function EffortPicker({ value, onChange }: EffortPickerProps) {
  // Find which category contains the selected value
  const selectedCategory = value
    ? EFFORT_CATEGORIES.find(cat => cat.levels.includes(value))
    : null;

  return (
    <div className="space-y-4">
      {/* Visual Bar Chart with Ghost Columns */}
      <div className="flex items-end justify-center gap-3 h-48 px-2">
        {EFFORT_CATEGORIES.map((category) => {
          const isSelected = selectedCategory === category;

          return (
            <div
              key={category.name}
              className={`relative flex-1 ${category.barHeight} rounded-xl transition-all ${
                isSelected
                  ? 'bg-emerald-100 dark:bg-emerald-900/30 ring-2 ring-emerald-500'
                  : 'bg-slate-200 dark:bg-slate-700/50'
              }`}
            >
              {/* Category label */}
              <span className={`absolute -bottom-6 left-0 right-0 text-xs text-center ${
                isSelected ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-slate-500 dark:text-slate-400'
              }`}>
                {category.name}
              </span>

              {/* Clickable columns with dots for each level */}
              <div className="absolute inset-0 flex">
                {category.levels.map((level) => {
                  const isLevelSelected = value === level;
                  return (
                    <button
                      key={level}
                      onClick={() => onChange(level)}
                      className="flex-1 relative hover:bg-black/5 dark:hover:bg-white/5 transition-colors rounded-lg"
                      aria-label={`${level} - ${LEVEL_LABELS[level]}`}
                    >
                      {/* Ghost column or selected indicator */}
                      <div
                        className={`absolute bottom-8 left-1/2 -translate-x-1/2 w-2.5 rounded-full transition-all ${
                          isLevelSelected
                            ? 'bg-emerald-500'
                            : 'bg-slate-300 dark:bg-slate-600'
                        }`}
                        style={{ height: 'calc(100% - 2.5rem)' }}
                      />
                      {/* Dot */}
                      <div
                        className={`absolute bottom-3 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full transition-all ${
                          isLevelSelected
                            ? 'bg-emerald-500 scale-150'
                            : isSelected
                              ? 'bg-emerald-400/50'
                              : 'bg-slate-400 dark:bg-slate-500'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Value Display */}
      <div className="flex items-center justify-center px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 mt-8">
        {value ? (
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm font-semibold">
              {value}
            </span>
            <span className="font-medium text-slate-900 dark:text-slate-100">
              {LEVEL_LABELS[value]}
            </span>
          </div>
        ) : (
          <span className="text-slate-500 dark:text-slate-400">
            Tap a bar to rate your effort
          </span>
        )}
      </div>

      {/* Skip link */}
      <button
        onClick={() => onChange(undefined)}
        className="w-full text-center text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 underline transition-colors py-3"
      >
        Skip rating
      </button>
    </div>
  );
}
