import { useState, useEffect } from 'react';
import { ThumbsUp } from 'lucide-react';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { Feature } from '../types';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';

interface VoteButtonProps {
  feature: Feature;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onVoteUpdate?: (newVoteCount: number) => void;
}

export function VoteButton({ feature, size = 'md', className = '', onVoteUpdate }: VoteButtonProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isVoting, setIsVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [voteCount, setVoteCount] = useState(feature.votes);

  useEffect(() => {
    if (user && feature.votedBy) {
      setHasVoted(feature.votedBy.includes(user.uid));
    }
  }, [user, feature.votedBy]);

  const handleVote = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (!user) {
      navigate('/login');
      return;
    }

    if (isVoting || !feature.projectId) return;

    setIsVoting(true);
    try {
      const newVoteCount = hasVoted ? voteCount - 1 : voteCount + 1;
      setVoteCount(newVoteCount);
      setHasVoted(!hasVoted);

      const featureRef = doc(db, 'projects', feature.projectId, 'features', feature.id);
      await updateDoc(featureRef, {
        votes: newVoteCount,
        votedBy: hasVoted 
          ? arrayRemove(user.uid)
          : arrayUnion(user.uid),
        updatedAt: new Date()
      });

      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        votedFeatures: hasVoted
          ? arrayRemove(feature.id)
          : arrayUnion(feature.id),
        updatedAt: new Date()
      });

      onVoteUpdate?.(newVoteCount);
    } catch (error) {
      setVoteCount(feature.votes);
      setHasVoted(feature.votedBy?.includes(user.uid) || false);
      console.error('Error voting:', error);
    } finally {
      setIsVoting(false);
    }
  };

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <button
      onClick={handleVote}
      disabled={isVoting}
      className={clsx(
        'vote-box',
        hasVoted && 'active',
        sizeClasses[size],
        className,
        'relative group cursor-pointer'
      )}
      title={user ? (hasVoted ? 'Remove vote' : 'Vote for this feature') : 'Sign in to vote'}
    >
      <ThumbsUp 
        className={`${iconSizes[size]} mb-1 transition-transform ${
          hasVoted ? 'scale-110' : 'group-hover:scale-110'
        }`} 
      />
      <span className={`font-bold ${size === 'lg' ? 'text-xl' : 'text-sm'} transition-all ${
        isVoting ? 'animate-pulse' : ''
      }`}>
        {voteCount}
      </span>

      {!user && (
        <div className="absolute invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity bottom-full mb-1 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap">
          Sign in to vote
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-1.5 h-1.5 bg-gray-800"></div>
        </div>
      )}
    </button>
  );
}