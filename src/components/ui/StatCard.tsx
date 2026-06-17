import { LucideIcon } from 'lucide-react';
import { cn } from '../../utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'blue' | 'green' | 'yellow' | 'red';
  className?: string;
}

const colorClasses: Record<
  NonNullable<StatCardProps['color']>,
  { bg: string; icon: string; text: string }
> = {
  blue: {
    bg: 'bg-primary-50',
    icon: 'bg-primary-500',
    text: 'text-primary-600',
  },
  green: {
    bg: 'bg-success-50',
    icon: 'bg-success-500',
    text: 'text-success-600',
  },
  yellow: {
    bg: 'bg-warning-50',
    icon: 'bg-warning-500',
    text: 'text-warning-600',
  },
  red: {
    bg: 'bg-danger-50',
    icon: 'bg-danger-500',
    text: 'text-danger-600',
  },
};

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  color = 'blue',
  className = '',
}: StatCardProps) {
  const colors = colorClasses[color];

  return (
    <div className={cn('card p-6', className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className={`text-3xl font-bold ${colors.text}`}>{value}</p>
          {trend && (
            <p
              className={`text-xs mt-2 ${
                trend.isPositive ? 'text-success-600' : 'text-danger-600'
              }`}
            >
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}% 较上周
            </p>
          )}
        </div>
        <div
          className={`w-12 h-12 ${colors.icon} rounded-lg flex items-center justify-center`}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}
