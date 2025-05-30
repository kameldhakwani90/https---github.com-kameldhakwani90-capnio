import type { Status } from '@/types';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusColors: Record<Status, string> = {
    green: 'bg-green-500',
    orange: 'bg-orange-500',
    red: 'bg-red-500',
    white: 'bg-gray-300',
  };

  return (
    <span
      className={cn(
        'inline-block h-2.5 w-2.5 rounded-full',
        statusColors[status],
        className
      )}
      aria-label={`Status: ${status}`}
    />
  );
}
