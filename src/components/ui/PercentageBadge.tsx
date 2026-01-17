import Badge from './Badge';

interface PercentageBadgeProps {
  percentage: number;
  showPercentageSign?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function PercentageBadge({
  percentage,
  showPercentageSign = true,
  size = 'md',
}: PercentageBadgeProps) {
  const getVariant = (value: number) => {
    if (value >= 70) return 'success';
    if (value >= 40) return 'warning';
    if (value > 0) return 'danger';
    return 'default';
  };

  const getColor = (value: number) => {
    if (value >= 70) return '#10b981';
    if (value >= 40) return '#f59e0b';
    if (value > 0) return '#ef4444';
    return '#6b7280';
  };

  const displayValue = showPercentageSign
    ? `${percentage}%`
    : percentage.toString();

  return (
    <Badge
      variant={getVariant(percentage)}
      size={size}
      style={{
        backgroundColor: `${getColor(percentage)}15`,
        color: getColor(percentage),
        border: `1px solid ${getColor(percentage)}30`,
      }}
    >
      {displayValue}
    </Badge>
  );
}
