import { memo } from 'react';
import { ArrowBigUp } from 'lucide-react';
import { clsx } from 'clsx';

interface VoteScoreProps {
  score: number;
  hasVoted: boolean;
  onVote: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export const VoteScore = memo(function VoteScore({
  score,
  hasVoted,
  onVote,
  size = 'md'
}: VoteScoreProps) {
  return (
    <button
      onClick={onVote}
      className={clsx(
        'flex flex-col items-center rounded-lg transition-colors',
        {
          'p-1': size === 'sm',
          'p-2': size === 'md',
          'p-3': size === 'lg',
          'bg-blue-100 text-blue-600': hasVoted,
          'hover:bg-gray-100 text-gray-600': !hasVoted
        }
      )}
    >
      <ArrowBigUp
        className={clsx({
          'w-4 h-4': size === 'sm',
          'w-6 h-6': size === 'md',
          'w-8 h-8': size === 'lg'
        })}
      />
      <span
        className={clsx('font-medium', {
          'text-xs': size === 'sm',
          'text-sm': size === 'md',
          'text-base': size === 'lg'
        })}
      >
        {score}
      </span>
    </button>
  );
});