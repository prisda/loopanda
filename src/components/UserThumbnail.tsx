import { Link } from 'react-router-dom';
import { User } from '../types';

interface UserThumbnailProps {
  user?: User | null;
  timestamp?: Date;
  size?: 'sm' | 'md' | 'lg';
  showMeta?: boolean;
  className?: string;
}

export function UserThumbnail({ 
  user, 
  timestamp, 
  size = 'md', 
  showMeta = true,
  className = ''
}: UserThumbnailProps) {
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base'
  };

  if (!user) return null;

  return (
    <div className={`user-thumbnail ${className}`}>
      <div className="flex items-center gap-2">
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName}
            className={`rounded-full object-cover ${sizeClasses[size]}`}
          />
        ) : (
          <div className={`placeholder rounded-full bg-gray-100 flex items-center justify-center ${sizeClasses[size]}`}>
            {user.displayName?.charAt(0) || '?'}
          </div>
        )}
        <div className="info">
          <span className="name">
            {user.displayName || 'Anonymous User'}
          </span>
          {showMeta && timestamp && (
            <span className="meta">
              {new Date(timestamp).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}