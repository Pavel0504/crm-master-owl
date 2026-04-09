import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

export interface SortOption {
  value: string;
  label: string;
}

interface SortBarProps {
  options: SortOption[];
  value: string;
  direction: 'asc' | 'desc';
  onChange: (value: string) => void;
  onDirectionChange: (direction: 'asc' | 'desc') => void;
}

export default function SortBar({
  options,
  value,
  direction,
  onChange,
  onDirectionChange,
}: SortBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
      <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
        <ArrowUpDown className="h-4 w-4" />
        <span className="font-medium">Сортировка:</span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`
              px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ease-spring
              ${
                value === option.value
                  ? 'bg-gradient-to-r from-orange-500 to-rose-500 dark:from-burgundy-600 dark:to-burgundy-700 text-white shadow-md shadow-orange-500/20 dark:shadow-burgundy-700/30 scale-[1.02]'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 hover:scale-[1.02]'
              }
            `}
          >
            {option.label}
          </button>
        ))}

        <button
          onClick={() => onDirectionChange(direction === 'asc' ? 'desc' : 'asc')}
          className="p-2 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-200 press-effect"
          title={direction === 'asc' ? 'По возрастанию' : 'По убыванию'}
        >
          {direction === 'asc' ? (
            <ArrowUp className="h-4 w-4" />
          ) : (
            <ArrowDown className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}
