import { Link } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import { Feature } from '../../types';
import { VoteButton } from '../VoteButton';
import { CategoryBadge } from '../CategoryBadge';
import { UserThumbnail } from '../UserThumbnail';
import { formatDate } from '../../utils/date';
import { useLayoutStore } from '../../store/layoutStore';

interface RoadmapCardProps {
  feature: Feature;
  isDragging?: boolean;
}

export function RoadmapCard({ feature, isDragging }: RoadmapCardProps) {
  const { displayDensity } = useLayoutStore();

  return (
    <Link
      to={`/feature/${feature.id}?projectId=${feature.projectId}&category=${feature.category}`}
      className={`block bg-white border border-gray-200 rounded-lg hover:border-brand transition-colors ${
        isDragging ? 'shadow-lg' : ''
      }`}
    >
      <div className={`p-${displayDensity === 'compact' ? '3' : '4'}`}>
        <div className="flex items-start gap-3">
          <VoteButton feature={feature} size={displayDensity === 'compact' ? 'sm' : 'md'} />
          <div className="flex-1 min-w-0">
            <h3 className={`font-medium text-gray-900 mb-2 line-clamp-1 ${
              displayDensity === 'compact' ? 'text-sm' : 'text-base'
            }`}>
              {feature.title}
            </h3>
            {displayDensity !== 'compact' && (
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                {feature.description}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
              <span>{formatDate(feature.createdAt)}</span>
              <div className="flex items-center">
                <MessageSquare className="w-3.5 h-3.5 mr-1" />
                {feature.commentCount || 0}
              </div>
              <CategoryBadge category={feature.category} size="sm" />
            </div>
            {displayDensity !== 'compact' && feature.user && (
              <UserThumbnail 
                user={feature.user} 
                size="sm"
                className="mt-2"
              />
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}