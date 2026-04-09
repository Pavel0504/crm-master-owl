import { ReactNode, useState, useEffect, useRef } from 'react';
import { Filter, X, ChevronDown } from 'lucide-react';
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
  const [isExpanded, setIsExpanded] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsExpanded(window.innerWidth >= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <Card variant="bordered" padding="md">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between mb-4 md:cursor-default"
        type="button"
      >
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-orange-500 dark:text-burgundy-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
        </div>
        <div className="md:hidden">
          <ChevronDown
            className={`h-5 w-5 text-gray-500 dark:text-gray-400 transition-transform duration-300 ease-spring ${
              isExpanded ? 'rotate-180' : 'rotate-0'
            }`}
          />
        </div>
      </button>

      {/* Animated content */}
      <div
        ref={contentRef}
        className="overflow-hidden transition-all duration-300 ease-spring"
        style={{
          maxHeight: isExpanded ? contentRef.current?.scrollHeight ?? 1000 : 0,
          opacity: isExpanded ? 1 : 0,
        }}
      >
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
      </div>
    </Card>
  );
}
