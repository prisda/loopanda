import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { Image } from 'lucide-react';
import { ImageUploadModal } from './ImageUploadModal';
import { useProject } from '../contexts/ProjectContext';

interface CommentFormProps {
  featureId: string;
  onCommentAdded?: (comment: any) => void;
}

export function CommentForm({ featureId, onCommentAdded }: CommentFormProps) {
  const { user } = useAuth();
  const { currentProject } = useProject();
  const [content, setContent] = useState('');
  const [image, setImage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showImageUpload, setShowImageUpload] = useState(false);

  const validateComment = (text: string) => {
    const words = text.trim().split(/\s+/);
    return words.length >= 7;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !content.trim() || isSubmitting || !currentProject) return;

    if (!validateComment(content)) {
      setError('Comments must be at least 7 words long');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const commentData = {
        featureId,
        projectId: currentProject.id,
        content: content.trim(),
        image,
        createdAt: serverTimestamp(),
        createdBy: user.uid,
        userDisplayName: user.displayName,
        photoURL: user.photoURL,
        likes: 0,
        likedBy: [],
        approved: !currentProject.settings?.requireCommentApproval || user.isAdmin
      };

      const docRef = await addDoc(
        collection(db, 'projects', currentProject.id, 'comments'),
        commentData
      );

      // Add client timestamp for immediate display
      const newComment = {
        ...commentData,
        id: docRef.id,
        createdAt: { toDate: () => new Date() }
      };

      onCommentAdded?.(newComment);
      
      setContent('');
      setImage('');
    } catch (error) {
      console.error('Error adding comment:', error);
      setError('Failed to post comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentProject) {
    return null;
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="card mb-8">
        <div className="card-body">
          <textarea
            rows={4}
            className="input-primary mb-4"
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              setError('');
            }}
            placeholder="Share your thoughts (minimum 7 words)..."
          />
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}

          {currentProject.settings?.requireCommentApproval && !user?.isAdmin && (
            <p className="text-sm text-gray-500 mb-4">
              Comments require approval before being published.
            </p>
          )}

          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={() => setShowImageUpload(true)}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <Image className="w-5 h-5 mr-2" />
              {image ? 'Change Image' : 'Add Image'}
            </button>

            <button
              type="submit"
              disabled={!content.trim() || isSubmitting}
              className="btn-primary"
            >
              {isSubmitting ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </div>
      </form>

      <ImageUploadModal
        isOpen={showImageUpload}
        onClose={() => setShowImageUpload(false)}
        onUpload={setImage}
        currentImage={image}
        type="feature"
      />
    </>
  );
}