import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  doc,
  getDoc,
  collection,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
  where,
  serverTimestamp,
  Unsubscribe
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Feature, Comment, User, FeatureStatus } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { CommentList } from '../components/CommentList';
import { CommentForm } from '../components/CommentForm';
import { ArrowLeft, MessageSquare, Image, Edit2, Save } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { VoteButton } from '../components/VoteButton';
import { CategoryBadge } from '../components/CategoryBadge';
import { useProject } from '../contexts/ProjectContext';
import { ImageModal } from '../components/ImageModal';
import { ImageUpload } from '../components/ImageUpload';
import { UserThumbnail } from '../components/UserThumbnail';

const STATUS_OPTIONS = [
  { value: 'under-review', label: 'Under Review' },
  { value: 'planned', label: 'Planned' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
] as const;

type FeatureFormData = {
  title: string;
  description: string;
  category: string;
  images: string[];
};

export function FeatureDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentProject } = useProject();

  // State management
  const [feature, setFeature] = useState<Feature | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState({
    feature: true,
    comments: true,
    update: false,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<FeatureFormData>({
    title: '',
    description: '',
    category: '',
    images: [],
  });
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [submitter, setSubmitter] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Reset form data when feature changes
  useEffect(() => {
    if (feature) {
      setFormData({
        title: feature.title,
        description: feature.description,
        category: feature.category,
        images: feature.images || [],
      });
    }
  }, [feature]);

  // Fetch feature and set up comments listener
  useEffect(() => {
    let unsubscribeComments: Unsubscribe | undefined;

    const fetchFeature = async () => {
      if (!id || !currentProject?.id) {
        setLoading(prev => ({ ...prev, feature: false }));
        setError('Invalid feature or project ID');
        return;
      }

      try {
        setError(null);
        const docRef = doc(db, 'projects', currentProject.id, 'features', id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          setError('Feature not found');
          return;
        }

        const featureData = {
          id: docSnap.id,
          ...docSnap.data(),
          projectId: currentProject.id,
        } as Feature;

        setFeature(featureData);

        // Fetch submitter details
        if (featureData.createdBy) {
          try {
            const userDoc = await getDoc(doc(db, 'users', featureData.createdBy));
            if (userDoc.exists()) {
              setSubmitter(userDoc.data() as User);
            }
          } catch (error) {
            console.error('Error fetching submitter:', error);
          }
        }

        // Set up real-time comments listener
        const commentsQuery = query(
          collection(db, 'projects', currentProject.id, 'comments'),
          where('featureId', '==', id),
          orderBy('createdAt', 'desc')
        );

        unsubscribeComments = onSnapshot(
          commentsQuery,
          (snapshot) => {
            const commentsData = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
              projectId: currentProject.id
            })) as Comment[];
            setComments(commentsData);
            setLoading(prev => ({ ...prev, comments: false }));
          },
          (error) => {
            console.error('Error fetching comments:', error);
            setError('Failed to load comments');
            setLoading(prev => ({ ...prev, comments: false }));
          }
        );

      } catch (error) {
        console.error('Error fetching feature:', error);
        setError('Failed to load feature details');
      } finally {
        setLoading(prev => ({ ...prev, feature: false }));
      }
    };

    fetchFeature();

    return () => {
      if (unsubscribeComments) {
        unsubscribeComments();
      }
    };
  }, [id, currentProject?.id]);

  // Handler functions
  const handleStatusChange = async (newStatus: string) => {
    if (!feature || !currentProject || !user?.isAdmin) {
      setError('Unauthorized to change status');
      return;
    }

    setLoading(prev => ({ ...prev, update: true }));
    try {
      const featureRef = doc(db, 'projects', currentProject.id, 'features', feature.id);
      await updateDoc(featureRef, {
        status: newStatus,
        updatedAt: serverTimestamp()
      });

      setFeature(prev => prev ? {
        ...prev,
        status: newStatus as FeatureStatus,
        updatedAt: new Date()
      } : null);
      
      setSuccessMessage('Status updated successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Error updating status:', error);
      setError('Failed to update status');
    } finally {
      setLoading(prev => ({ ...prev, update: false }));
    }
  };

  const handleFormChange = (field: keyof FeatureFormData, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!feature || !currentProject || loading.update) return;

    // Validate form data
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    setLoading(prev => ({ ...prev, update: true }));
    try {
      const featureRef = doc(db, 'projects', currentProject.id, 'features', feature.id);
      const updateData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        images: formData.images,
        updatedAt: serverTimestamp()
      };

      await updateDoc(featureRef, updateData);

      setFeature(prev => prev ? {
        ...prev,
        ...updateData,
        updatedAt: new Date()
      } : null);

      setIsEditing(false);
      setError(null);
      setSuccessMessage('Feature updated successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Error updating feature:', error);
      setError('Failed to update feature');
    } finally {
      setLoading(prev => ({ ...prev, update: false }));
    }
  };

  const handleImageUpload = useCallback((url: string) => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, url]
    }));
  }, []);

  const handleRemoveImage = useCallback((indexToRemove: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove)
    }));
  }, []);

  // Render helpers
  if (!currentProject) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            No Project Selected
          </h2>
          <p className="text-gray-600">
            Please select a project to view feature details.
          </p>
        </div>
      </div>
    );
  }

  if (loading.feature) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !feature) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {error || 'Feature not found'}
          </h2>
          <button
            onClick={() => navigate('/features')}
            className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Features
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to features
      </button>

      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 text-green-800 rounded-lg">
          {successMessage}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            {isEditing ? (
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleFormChange('title', e.target.value)}
                className="w-full text-2xl font-bold mb-4 px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="Feature title"
              />
            ) : (
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                {feature.title}
              </h1>
            )}

            <div className="flex items-center gap-4 text-sm text-gray-500">
              {submitter && (
                <UserThumbnail user={submitter} timestamp={feature.createdAt} />
              )}
              <CategoryBadge category={feature.category} />
              <StatusBadge status={feature.status} />
            </div>
          </div>

          <div className="flex items-start gap-4">
            <VoteButton feature={feature} size="lg" />
            {user?.isAdmin && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-gray-100"
              >
                <Edit2 className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleFormChange('description', e.target.value)}
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="Feature description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleFormChange('category', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Feature">Feature</option>
                <option value="Bug">Bug</option>
                <option value="Enhancement">Enhancement</option>
                <option value="Documentation">Documentation</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Images
              </label>
              <ImageUpload
                onUpload={handleImageUpload}
                type="feature"
                className="mb-4"
              />
              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 gap-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt=""
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                disabled={loading.update}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading.update}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <Save className="w-4 h-4 mr-2" />
                {loading.update ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="prose max-w-none mb-6">
              <p className="text-gray-600 whitespace-pre-wrap">
                {feature.description}
              </p>
            </div>

            {feature.images?.length > 0 && (
              <div className="grid grid-cols-2 gap-4 mb-6">
                {feature.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(image)}
                    className="relative group"
                  >
                    <img
                      src={image}
                      alt=""
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity rounded-lg" />
                  </button>
                ))}
              </div>
            )}

            {user?.isAdmin && (
              <div className="border-t border-gray-100 pt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={feature.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  disabled={loading.update}
                  className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </>
        )}
      </div>

      <div className="space-y-8">
        {!loading.comments ? (
          <>
            <CommentForm featureId={feature.id} />
            <CommentList comments={comments} />
          </>
        ) : (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>

      <ImageModal
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        imageUrl={selectedImage || ''}
      />
    </div>
  );
}