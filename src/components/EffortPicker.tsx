import type { EffortLevel } from '../types';
import { EFFORT_DESCRIPTIONS } from '../types';

interface EffortPickerProps {
  value?: EffortLevel;
  onChange: (effort: EffortLevel) => void;
}

export function EffortPicker({ value, onChange }: EffortPickerProps) {
  const levels: EffortLevel[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  const getColor = (level: EffortLevel) => {
    if (level <= 3) return 'bg-emerald-600';
    if (level <= 5) return 'bg-emerald-500';
    if (level <= 7) return 'bg-amber-500';
    if (level <= 9) return 'bg-red-500';
    return 'bg-red-600';
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between gap-1">
        {levels.map(level => (
          <button
            key={level}
            onClick={() => onChange(level)}
            className={`w-8 h-8 rounded-lg text-sm font-medium transition-all active:scale-95 ${
              value === level
                ? `${getColor(level)} text-white ring-2 ring-white ring-offset-2 ring-offset-slate-900`
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            {level}
          </button>
        ))}
      </div>

      {value && (
        <div className="text-center">
          <div className="text-lg font-medium text-slate-100">
            {EFFORT_DESCRIPTIONS[value].label}
          </div>
          <div className="text-sm text-slate-400">
            {EFFORT_DESCRIPTIONS[value].description}
          </div>
        </div>
      )}
    </div>
  );
}
