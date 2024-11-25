import { clsx } from 'clsx';
import { AlignJustify, AlignCenter, AlignLeft } from 'lucide-react';
import { useLayoutStore } from '../../store/layoutStore';

export function DensitySelector() {
  const { displayDensity, setDisplayDensity } = useLayoutStore();

  const options = [
    { value: 'loose', label: 'Loose', icon: AlignJustify },
    { value: 'normal', label: 'Normal', icon: AlignCenter },
    { value: 'compact', label: 'Compact', icon: AlignLeft },
  ] as const;

  return (
    <div className="flex items-center gap-1 bg-white rounded-lg p-1 border border-gray-200">
      {options.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          onClick={() => setDisplayDensity(value)}
          className={clsx(
            'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors',
            displayDensity === value
              ? 'bg-brand text-white'
              : 'text-gray-600 hover:bg-gray-100'
          )}
          title={`${label} view`}
        >
          <Icon className="w-4 h-4" />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
}