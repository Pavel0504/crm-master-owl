import { ReactNode } from 'react';
import { Filter, X } from 'lucide-react';
import Card from './Card';
import Button from './Button';

interface FilterPanelProps {
  children: ReactNode;
  onReset?: () => void;
  onApply?: () => void;
  showActions?: boolean;
  title?: string;
}

export default function FilterPanel({
  children,
  onReset,
  onApply,
  showActions = true,
  title = 'Фильтры',
}: FilterPanelProps) {
  return (
    <Card variant="bordered" padding="md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-orange-500 dark:text-burgundy-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
        </div>
      </div>

      <div className="space-y-4">{children}</div>

      {showActions && (onReset || onApply) && (
        <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          {onReset && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Сбросить
            </Button>
          )}
          {onApply && (
            <Button variant="primary" size="sm" onClick={onApply} fullWidth>
              Применить
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}
