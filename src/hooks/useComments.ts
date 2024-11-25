import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Comment } from '../types';
import { useCommentStore } from '../store/commentStore';
import { useAuth } from './useAuth';

export function useComments(featureId: string, projectId: string) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { comments, setComments, addComment, updateComment, deleteComment } = useCommentStore();

  useEffect(() => {
    if (!featureId || !projectId) return;

    const q = query(
      collection(db, 'projects', projectId, 'comments'),
      where('featureId', '==', featureId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const commentsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Comment[];
        setComments(featureId, commentsData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching comments:', err);
        setError('Failed to load comments');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [featureId, projectId]);

  const addNewComment = async (content: string, parentId?: string) => {
    if (!user) throw new Error('Must be signed in to comment');

    try {
      const commentData = {
        content,
        featureId,
        projectId,
        createdBy: user.uid,
        userDisplayName: user.displayName || 'Anonymous',
        photoURL: user.photoURL,
        createdAt: serverTimestamp(),
        likes: 0,
        likedBy: [],
        approved: true,
        parentId: parentId || null
      };

      const docRef = await addDoc(
        collection(db, 'projects', projectId, 'comments'),
        commentData
      );

      addComment(featureId, { id: docRef.id, ...commentData });
      return docRef.id;
    } catch (err) {
      console.error('Error adding comment:', err);
      throw new Error('Failed to add comment');
    }
  };

  const updateExistingComment = async (commentId: string, updates: Partial<Comment>) => {
    try {
      await updateDoc(
        doc(db, 'projects', projectId, 'comments', commentId),
        {
          ...updates,
          updatedAt: serverTimestamp()
        }
      );
      updateComment(featureId, commentId, updates);
    } catch (err) {
      console.error('Error updating comment:', err);
      throw new Error('Failed to update comment');
    }
  };

  const removeComment = async (commentId: string) => {
    try {
      await deleteDoc(
        doc(db, 'projects', projectId, 'comments', commentId)
      );
      deleteComment(featureId, commentId);
    } catch (err) {
      console.error('Error deleting comment:', err);
      throw new Error('Failed to delete comment');
    }
  };

  return {
    comments: comments[featureId] || [],
    loading,
    error,
    addComment: addNewComment,
    updateComment: updateExistingComment,
    deleteComment: removeComment
  };
}