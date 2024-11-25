import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Comment } from '../types';
import { formatDate } from '../utils/date';
import { Check, X, MessageSquare, Filter } from 'lucide-react';
import { useProject } from '../contexts/ProjectContext';

export function AdminCommentsPage() {
  const { user } = useAuth();
  const { currentProject } = useProject();
  const navigate = useNavigate();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState('All');

  useEffect(() => {
    if (!user?.isAdmin || !currentProject?.id) {
      setLoading(false);
      return;
    }

    const fetchComments = async () => {
      try {
        setError(null);
        
        // Only fetch unapproved comments from the project's comments subcollection
        const commentsRef = collection(db, 'projects', currentProject.id, 'comments');
        const q = query(
          commentsRef,
          where('approved', '==', false),
          orderBy('createdAt', 'desc')
        );

        const commentsSnap = await getDocs(q);
        const commentsData = commentsSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          projectId: currentProject.id
        })) as Comment[];

        setComments(commentsData);
      } catch (err: any) {
        console.error('Error fetching comments:', err);
        setError('Failed to load comments');
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [user, currentProject?.id]);

  const handleApprove = async (commentId: string) => {
    if (processingId || !currentProject) return;
    setProcessingId(commentId);
    setError(null);

    try {
      const commentRef = doc(db, 'projects', currentProject.id, 'comments', commentId);
      await updateDoc(commentRef, {
        approved: true,
        approvedAt: new Date(),
        approvedBy: user?.uid,
        updatedAt: new Date()
      });
      setComments(comments.filter(c => c.id !== commentId));
    } catch (err) {
      console.error('Error approving comment:', err);
      setError('Failed to approve comment');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (commentId: string) => {
    if (processingId || !currentProject) return;
    if (!window.confirm('Are you sure you want to reject this comment?')) return;

    setProcessingId(commentId);
    setError(null);

    try {
      await deleteDoc(doc(db, 'projects', currentProject.id, 'comments', commentId));
      setComments(comments.filter(c => c.id !== commentId));
    } catch (err) {
      console.error('Error rejecting comment:', err);
      setError('Failed to reject comment');
    } finally {
      setProcessingId(null);
    }
  };

  // Filter comments by feature
  const filteredComments = comments.filter(comment => 
    selectedFeature === 'All' || comment.featureId === selectedFeature
  );

  if (!user?.isAdmin || !currentProject) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {!user?.isAdmin ? 'Admin Access Required' : 'No Project Selected'}
          </h2>
          <p className="text-gray-600">
            {!user?.isAdmin 
              ? 'You need admin privileges to access this page.'
              : 'Please select a project to manage comments.'}
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {currentProject.name}
          <span className="text-gray-500 font-normal ml-2">/ Comment Approval</span>
        </h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </button>
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
            {filteredComments.length} pending
          </span>
        </div>
      </div>

      {showFilters && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Feature
            </label>
            <select
              value={selectedFeature}
              onChange={(e) => setSelectedFeature(e.target.value)}
              className="select select-bordered w-full max-w-xs"
            >
              <option value="All">All Features</option>
              {/* Add feature options dynamically */}
            </select>
          </div>
        </div>
      )}

      {filteredComments.length > 0 ? (
        <div className="space-y-4">
          {filteredComments.map(comment => (
            <div key={comment.id} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-medium text-gray-900">{comment.userDisplayName}</h3>
                    <span className="text-sm text-gray-500">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-gray-600 whitespace-pre-wrap mb-4">
                    {comment.content}
                  </p>
                  {comment.image && (
                    <img 
                      src={comment.image} 
                      alt="Comment attachment" 
                      className="rounded-lg max-h-64 object-cover mb-4"
                    />
                  )}
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleApprove(comment.id)}
                    disabled={processingId === comment.id}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Approve comment"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleReject(comment.id)}
                    disabled={processingId === comment.id}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Reject comment"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No pending comments to review</p>
        </div>
      )}
    </div>
  );
}