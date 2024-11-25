import { useMemo } from 'react';
import { Feature } from '../../types';
import { Link } from 'react-router-dom';
import { ThumbsUp, MessageSquare } from 'lucide-react';
import { CategoryBadge } from '../CategoryBadge';
import { formatDate } from '../../utils/date';
import { subDays } from 'date-fns';

interface TopFeaturesProps {
  features: Feature[];
}

export function TopFeatures({ features }: TopFeaturesProps) {
  const topFeatures = useMemo(() => {
    const sevenDaysAgo = subDays(new Date(), 7);
    return features
      .filter(feature => feature.createdAt.toDate() >= sevenDaysAgo)
      .sort((a, b) => b.votes - a.votes)
      .slice(0, 5);
  }, [features]);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Features This Week</h2>
      
      <div className="space-y-4">
        {topFeatures.map(feature => (
          <Link
            key={feature.id}
            to={`/feature/${feature.id}`}
            className="block p-4 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 mb-1 line-clamp-1">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                  {feature.description}
                </p>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <span className="flex items-center">
                    <ThumbsUp className="w-4 h-4 mr-1" />
                    {feature.votes}
                  </span>
                  <span className="flex items-center">
                    <MessageSquare className="w-4 h-4 mr-1" />
                    {feature.commentCount || 0}
                  </span>
                  <CategoryBadge category={feature.category} size="sm" />
                  <span>{formatDate(feature.createdAt)}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}

        {topFeatures.length === 0 && (
          <p className="text-center text-gray-500 py-4">
            No features submitted in the last 7 days
          </p>
        )}
      </div>
    </div>
  );
}