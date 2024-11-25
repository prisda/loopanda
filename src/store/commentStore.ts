import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Comment } from '../types';

interface CommentState {
  comments: Record<string, Comment[]>;
  setComments: (featureId: string, comments: Comment[]) => void;
  addComment: (featureId: string, comment: Comment) => void;
  updateComment: (featureId: string, commentId: string, updates: Partial<Comment>) => void;
  deleteComment: (featureId: string, commentId: string) => void;
  getCommentCount: (featureId: string) => number;
}

export const useCommentStore = create<CommentState>()(
  persist(
    (set, get) => ({
      comments: {},
      setComments: (featureId, comments) =>
        set(state => ({
          comments: { ...state.comments, [featureId]: comments }
        })),
      addComment: (featureId, comment) =>
        set(state => ({
          comments: {
            ...state.comments,
            [featureId]: [...(state.comments[featureId] || []), comment]
          }
        })),
      updateComment: (featureId, commentId, updates) =>
        set(state => ({
          comments: {
            ...state.comments,
            [featureId]: state.comments[featureId]?.map(comment =>
              comment.id === commentId ? { ...comment, ...updates } : comment
            ) || []
          }
        })),
      deleteComment: (featureId, commentId) =>
        set(state => ({
          comments: {
            ...state.comments,
            [featureId]: state.comments[featureId]?.filter(
              comment => comment.id !== commentId
            ) || []
          }
        })),
      getCommentCount: (featureId) => {
        const comments = get().comments[featureId] || [];
        return comments.filter(comment => comment.approved).length;
      }
    }),
    {
      name: 'feature-comments'
    }
  )
);