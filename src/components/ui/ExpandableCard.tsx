import { useState, useRef, useEffect, ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
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
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<number>(0);

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [isExpanded, children]);

  return (
    <Card variant={variant} padding="none" className="card-hover">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200 rounded-t-2xl"
      >
        <div className="flex items-center justify-between w-full">
          <div className="text-left flex-1 min-w-0">{title}</div>
          <div className="ml-2 flex-shrink-0">
            <ChevronDown
              className={`h-5 w-5 text-gray-500 dark:text-gray-400 transition-transform duration-300 ease-spring ${
                isExpanded ? 'rotate-180' : 'rotate-0'
              }`}
            />
          </div>
        </div>
        {headerContent && (
          <div className="flex items-center justify-between w-full sm:w-auto gap-2">
            {headerContent}
          </div>
        )}
      </button>

      <div
        style={{
          maxHeight: isExpanded ? `${contentHeight}px` : '0px',
          opacity: isExpanded ? 1 : 0,
        }}
        className="overflow-hidden transition-all duration-300 ease-spring"
      >
        <div ref={contentRef} className="px-6 pb-6 pt-2 border-t border-gray-200 dark:border-gray-700">
          {children}
        </div>
      </div>
    </Card>
  );
}
