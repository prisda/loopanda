import { useState } from 'react';
import { Comment } from '../types';
import { ThumbsUp, MessageSquare, Trash2, Clock, Reply } from 'lucide-react';
import { doc, updateDoc, deleteDoc, arrayUnion, arrayRemove, addDoc, collection, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { useProject } from '../contexts/ProjectContext';
import { ErrorAlert } from './ErrorAlert';
import { UserThumbnail } from './UserThumbnail';
import { clsx } from 'clsx';

interface CommentListProps {
  comments: Comment[];
  onError?: (error: string) => void;
  onCommentUpdate?: () => void;
}

type SortOption = 'latest' | 'likes';

export function CommentList({ comments = [], onError, onCommentUpdate }: CommentListProps) {
  const { user } = useAuth();
  const { currentProject } = useProject();
  const [sortBy, setSortBy] = useState<SortOption>('latest');
  const [isLiking, setIsLiking] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  // Safely handle date conversion
  const getTimestamp = (date: any): number => {
    if (!date) return 0;
    if (date instanceof Timestamp) {
      return date.toDate().getTime();
    }
    if (date.toDate && typeof date.toDate === 'function') {
      return date.toDate().getTime();
    }
    return new Date(date).getTime();
  };

  // Organize comments into a tree structure
  const organizeComments = (commentsArray: Comment[]) => {
    const topLevelComments: Comment[] = [];
    const replyMap = new Map<string, Comment[]>();

    // First pass: separate top-level comments and replies
    commentsArray.forEach(comment => {
      if (!comment.parentId) {
        topLevelComments.push(comment);
      } else {
        const replies = replyMap.get(comment.parentId) || [];
        replies.push(comment);
        replyMap.set(comment.parentId, replies);
      }
    });

    // Sort top-level comments
    topLevelComments.sort((a, b) => {
      if (sortBy === 'likes') {
        return (b.likes || 0) - (a.likes || 0);
      }
      return getTimestamp(b.createdAt) - getTimestamp(a.createdAt);
    });

    // Sort replies by timestamp (always chronological)
    replyMap.forEach(replies => {
      replies.sort((a, b) => getTimestamp(a.createdAt) - getTimestamp(b.createdAt));
    });

    return { topLevelComments, replyMap };
  };

  const { topLevelComments, replyMap } = organizeComments(comments);

  const handleLike = async (comment: Comment) => {
    if (!user || isLiking || !currentProject) {
      setError('Unable to like comment at this time');
      return;
    }

    setIsLiking(comment.id);
    setError(null);
    
    try {
      const hasLiked = comment.likedBy?.includes(user.uid);
      const commentRef = doc(db, 'projects', currentProject.id, 'comments', comment.id);
      
      await updateDoc(commentRef, {
        likes: hasLiked ? (comment.likes || 1) - 1 : (comment.likes || 0) + 1,
        likedBy: hasLiked 
          ? arrayRemove(user.uid)
          : arrayUnion(user.uid),
        updatedAt: serverTimestamp()
      });
      onCommentUpdate?.();
    } catch (error) {
      console.error('Error liking comment:', error);
      const errorMessage = 'Failed to update like status';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLiking(null);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!user?.isAdmin || isDeleting || !currentProject) {
      setError('Unable to delete comment at this time');
      return;
    }
    
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    setIsDeleting(commentId);
    setError(null);

    try {
      await deleteDoc(doc(db, 'projects', currentProject.id, 'comments', commentId));
      onCommentUpdate?.();
    } catch (error) {
      console.error('Error deleting comment:', error);
      const errorMessage = 'Failed to delete comment';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleSubmitReply = async (parentComment: Comment) => {
    if (!user || isSubmittingReply || !currentProject || !replyContent.trim()) {
      setError('Unable to submit reply at this time');
      return;
    }

    setIsSubmittingReply(true);
    setError(null);

    try {
      const replyData = {
        content: replyContent.trim(),
        featureId: parentComment.featureId,
        projectId: currentProject.id,
        createdBy: user.uid,
        userDisplayName: user.displayName || 'Anonymous',
        createdAt: serverTimestamp(),
        likes: 0,
        likedBy: [],
        approved: Boolean(!currentProject.settings?.requireCommentApproval || user.isAdmin),
        parentId: parentComment.id
      };

      await addDoc(collection(db, 'projects', currentProject.id, 'comments'), replyData);
      setReplyContent('');
      setReplyingTo(null);
      onCommentUpdate?.();
    } catch (error) {
      console.error('Error submitting reply:', error);
      const errorMessage = 'Failed to submit reply';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const renderComment = (comment: Comment, isReply = false) => {
    const replies = replyMap.get(comment.id) || [];

    return (
      <div 
        key={comment.id} 
        className={clsx(
          "bg-white rounded-lg shadow-sm",
          isReply ? "ml-8 mt-4" : "mb-4"
        )}
      >
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <UserThumbnail 
              user={comment} 
              timestamp={comment.createdAt} 
            />
            <div className="flex items-center gap-2">
              {comment.approved === false && (
                <span className="flex items-center text-yellow-600 text-sm">
                  <Clock className="w-4 h-4 mr-1" />
                  Pending Approval
                </span>
              )}
              <button
                onClick={() => handleLike(comment)}
                disabled={isLiking === comment.id}
                className={clsx(
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors",
                  comment.likedBy?.includes(user?.uid || '')
                    ? "bg-brand/10 text-brand"
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                <ThumbsUp className="w-4 h-4" />
                <span>{comment.likes || 0}</span>
              </button>
              {user?.isAdmin && (
                <button
                  onClick={() => handleDelete(comment.id)}
                  disabled={isDeleting === comment.id}
                  className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100"
                  title="Delete comment"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          <p className="text-gray-600 whitespace-pre-wrap">
            {comment.content || 'No content'}
          </p>
          {comment.image && (
            <img 
              src={comment.image} 
              alt="Comment attachment" 
              className="mt-4 rounded-lg max-h-64 object-cover"
            />
          )}
          {!isReply && (
            <div className="mt-4">
              <button
                onClick={() => setReplyingTo(comment.id)}
                className="flex items-center text-sm text-gray-500 hover:text-brand"
              >
                <Reply className="w-4 h-4 mr-1" />
                Reply
              </button>
            </div>
          )}

          {replyingTo === comment.id && (
            <div className="mt-4 space-y-4">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write your reply..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-brand focus:border-brand"
                rows={3}
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setReplyingTo(null);
                    setReplyContent('');
                  }}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSubmitReply(comment)}
                  disabled={isSubmittingReply || !replyContent.trim()}
                  className="px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand/90 disabled:opacity-50"
                >
                  {isSubmittingReply ? 'Submitting...' : 'Submit Reply'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Render replies */}
        {replies.length > 0 && (
          <div className="border-t border-gray-100">
            {replies.map(reply => renderComment(reply, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {error && <ErrorAlert message={error} />}

      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          {comments.length} Comments
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setSortBy('latest')}
            className={clsx(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              sortBy === 'latest'
                ? 'bg-brand text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            Latest
          </button>
          <button
            onClick={() => setSortBy('likes')}
            className={clsx(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              sortBy === 'likes'
                ? 'bg-brand text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            Most Liked
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {topLevelComments.map(comment => renderComment(comment))}
      </div>
    </div>
  );
}