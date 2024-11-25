import { FeatureStatus } from '../types';
import { clsx } from 'clsx';

interface StatusBadgeProps {
  status: FeatureStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={clsx(
        'px-2 py-1 text-xs font-medium rounded-full',
        {
          'bg-yellow-100 text-yellow-800': status === 'planned',
          'bg-blue-100 text-blue-800': status === 'in-progress',
          'bg-green-100 text-green-800': status === 'completed',
          'bg-gray-100 text-gray-800': status === 'under-review',
        }
      )}
    >
      {status.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ')}
    </span>
  );
}