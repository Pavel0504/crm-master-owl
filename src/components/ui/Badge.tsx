import { HTMLAttributes, ReactNode } from 'react';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  customColor?: string;
}

export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  customColor,
  className = '',
  style,
  ...props
}: BadgeProps) {
  const variantClasses = {
    default: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
    primary: 'bg-gradient-to-r from-orange-100 to-rose-100 dark:from-burgundy-900/30 dark:to-burgundy-800/30 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-burgundy-700',
    success: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    warning: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
    danger: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
    info: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  const customStyle = customColor
    ? {
        backgroundColor: customColor,
        color: '#fff',
        ...style,
      }
    : style;

  return (
    <span
      className={`
        inline-flex items-center justify-center
        rounded-full font-medium
        ${!customColor ? variantClasses[variant] : ''}
        ${sizeClasses[size]}
        ${className}
      `}
      style={customStyle}
      {...props}
    >
      {children}
    </span>
  );
}
