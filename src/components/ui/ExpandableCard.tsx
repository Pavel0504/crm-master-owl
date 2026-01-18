import { useState, ReactNode } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import Card from './Card';

interface ExpandableCardProps {
  title: ReactNode;
  children: ReactNode;
  defaultExpanded?: boolean;
  headerContent?: ReactNode;
  variant?: 'default' | 'bordered' | 'elevated';
}

export default function ExpandableCard({
  title,
  children,
  defaultExpanded = false,
  headerContent,
  variant = 'bordered',
}: ExpandableCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <Card variant={variant} padding="none">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all rounded-t-2xl"
      >
        <div className="flex items-center justify-between w-full">
          <div className="text-left flex-1 min-w-0">{title}</div>
          <div className="ml-2 flex-shrink-0">
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            )}
          </div>
        </div>
        {headerContent && (
          <div className="flex items-center justify-between w-full sm:w-auto gap-2">
            {headerContent}
          </div>
        )}
      </button>

      {isExpanded && (
        <div className="px-6 pb-6 pt-2 border-t border-gray-200 dark:border-gray-700">
          {children}
        </div>
      )}
    </Card>
  );
}
