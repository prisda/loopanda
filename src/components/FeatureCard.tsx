import { MessageSquare } from 'lucide-react';
import { Feature } from '../types';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { StatusBadge } from './StatusBadge';
import { CategoryBadge } from './CategoryBadge';
import { formatDate } from '../utils/date';
import { VoteButton } from './VoteButton';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface FeatureCardProps {
  feature: Feature;
  commentCount?: number;
}

export function FeatureCard({ feature, commentCount: initialCommentCount = 0 }: FeatureCardProps) {
  const navigate = useNavigate();
  const [votes, setVotes] = useState(feature.votes);
  const [commentCount, setCommentCount] = useState(initialCommentCount);

  useEffect(() => {
    const fetchCommentCount = async () => {
      if (!feature.projectId) return;
      
      try {
        const q = query(
          collection(db, 'projects', feature.projectId, 'comments'),
          where('featureId', '==', feature.id)
        );
        const snapshot = await getDocs(q);
        setCommentCount(snapshot.size);
      } catch (error) {
        console.error('Error fetching comment count:', error);
        // Silently fail and keep initial count
      }
    };

    fetchCommentCount();
  }, [feature.id, feature.projectId]);

  const handleClick = () => {
    navigate(`/feature/${feature.id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-lg shadow-sm p-4 cursor-pointer hover:shadow-md transition-all hover:translate-y-[-1px]"
    >
      <div className="flex items-start gap-4">
        <VoteButton 
          feature={{ ...feature, votes }} 
          size="md"
          onVoteUpdate={setVotes}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className="text-base font-semibold text-gray-900 line-clamp-1">
              {feature.title}
            </h3>
            <StatusBadge status={feature.status} />
          </div>
          
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{feature.description}</p>
          
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>{formatDate(feature.createdAt)}</span>
            <div className="flex items-center">
              <MessageSquare className="w-3.5 h-3.5 mr-1" />
              {commentCount}
            </div>
            <CategoryBadge category={feature.category} size="sm" />
          </div>
        </div>
      </div>
    </div>
  );
}