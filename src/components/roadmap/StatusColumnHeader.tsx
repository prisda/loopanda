import { ClipboardList, Clock, PlayCircle, CheckCircle } from 'lucide-react';
import { FeatureStatus } from '../../types';

interface StatusColumnHeaderProps {
  status: FeatureStatus;
  count: number;
}

const STATUS_ICONS = {
  'under-review': Clock,
  'planned': ClipboardList,
  'in-progress': PlayCircle,
  'completed': CheckCircle
};

const STATUS_COLORS = {
  'under-review': 'text-yellow-500',
  'planned': 'text-blue-500',
  'in-progress': 'text-purple-500',
  'completed': 'text-green-500'
};

export function StatusColumnHeader({ status, count }: StatusColumnHeaderProps) {
  const Icon = STATUS_ICONS[status];
  const colorClass = STATUS_COLORS[status];

  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-100">
      <div className="flex items-center gap-2">
        <Icon className={`w-5 h-5 ${colorClass}`} />
        <h2 className="text-sm font-semibold text-gray-900">
          {status.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ')}
        </h2>
      </div>
      <span className="text-xs font-medium text-gray-500">
        {count}
      </span>
    </div>
  );
}