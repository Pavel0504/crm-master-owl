import { ReactNode } from 'react';

interface PageHeaderProps {
  icon: ReactNode;
  title: string;
  subtitle: string;
  actions?: ReactNode;
}

export default function PageHeader({ icon, title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-rose-400 dark:from-burgundy-600 dark:to-burgundy-700 rounded-xl flex items-center justify-center flex-shrink-0">
          {icon}
        </div>
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white truncate">
            {title}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 truncate">
            {subtitle}
          </p>
        </div>
      </div>

      {actions && (
        <div className="flex gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
          {actions}
        </div>
      )}
    </div>
  );
}
