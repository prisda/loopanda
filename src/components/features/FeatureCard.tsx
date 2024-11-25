import { MessageSquare } from 'lucide-react';
import { Feature } from '../../types';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { StatusBadge } from '../StatusBadge';
import { CategoryBadge } from '../CategoryBadge';
import { formatDate } from '../../utils/date';
import { VoteButton } from '../VoteButton';
import { UserThumbnail } from '../UserThumbnail';
import { useLayoutStore } from '../../store/layoutStore';
import { clsx } from 'clsx';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';

interface FeatureCardProps {
  feature: Feature;
}

export function FeatureCard({ feature }: FeatureCardProps) {
  const navigate = useNavigate();
  const { displayDensity } = useLayoutStore();
  const [votes, setVotes] = useState(feature.votes);
  const [commentCount, setCommentCount] = useState(0);
  const [activeUsers, setActiveUsers] = useState<any[]>([]);

  useEffect(() => {
    const fetchCommentCount = async () => {
      if (!feature.projectId) return;
      
      try {
        const q = query(
          collection(db, 'projects', feature.projectId, 'comments'),
          where('featureId', '==', feature.id),
          where('approved', '==', true)
        );
        const snapshot = await getDocs(q);
        setCommentCount(snapshot.size);

        // Get unique users who commented
        const uniqueUsers = new Set();
        snapshot.docs.forEach(doc => {
          const data = doc.data();
          if (data.createdBy) {
            uniqueUsers.add(data.createdBy);
          }
        });

        // Fetch user details for active users
        const userPromises = Array.from(uniqueUsers).slice(0, 3).map(async (uid: any) => {
          const userDoc = await getDocs(query(collection(db, 'users'), where('uid', '==', uid)));
          return userDoc.docs[0]?.data();
        });

        const users = await Promise.all(userPromises);
        setActiveUsers(users.filter(Boolean));
      } catch (error) {
        console.error('Error fetching comment count:', error);
      }
    };

    fetchCommentCount();
  }, [feature.id, feature.projectId]);

  const handleClick = () => {
    navigate(`/feature/${feature.id}`);
  };

  const densityStyles = {
    loose: 'p-6 gap-6',
    normal: 'p-4 gap-4',
    compact: 'p-3 gap-3'
  };

  return (
    <div
      onClick={handleClick}
      className={clsx(
        'bg-white rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-all hover:translate-y-[-1px]',
        densityStyles[displayDensity]
      )}
    >
      <div className="flex items-start gap-4">
        <VoteButton 
          feature={{ ...feature, votes }} 
          size={displayDensity === 'compact' ? 'sm' : 'md'}
          onVoteUpdate={setVotes}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex-1">
              <h3 className={clsx(
                'font-semibold text-gray-900 line-clamp-1',
                displayDensity === 'compact' ? 'text-sm' : 'text-base'
              )}>
                {feature.title}
              </h3>
              {displayDensity !== 'compact' && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {feature.description}
                </p>
              )}
            </div>
            <StatusBadge status={feature.status} />
          </div>

          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>{formatDate(feature.createdAt)}</span>
            <div className="flex items-center">
              <MessageSquare className="w-3.5 h-3.5 mr-1" />
              {commentCount}
            </div>
            <CategoryBadge category={feature.category} size="sm" />
          </div>

          {/* Active Users */}
          {activeUsers.length > 0 && (
            <div className="mt-3 flex items-center gap-2">
              <div className="flex -space-x-2">
                {activeUsers.map((user, index) => (
                  <UserThumbnail
                    key={user.uid}
                    user={user}
                    size="sm"
                    className={clsx(
                      'ring-2 ring-white',
                      index > 0 && '-ml-2'
                    )}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500">
                Active contributors
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}