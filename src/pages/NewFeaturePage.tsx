import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { ArrowLeft } from 'lucide-react';
import { FeatureForm } from '../components/FeatureForm';
import { useProject } from '../contexts/ProjectContext';

export function NewFeaturePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentProject } = useProject();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData: FormData, images: string[]) => {
    if (!user || !currentProject || isSubmitting) return;
    setIsSubmitting(true);

    try {
      await addDoc(
        collection(db, 'projects', currentProject.id, 'features'),
        {
          title: formData.get('title'),
          description: formData.get('description'),
          category: formData.get('category'),
          status: 'under-review',
          votes: 0,
          votedBy: [],
          images,
          projectId: currentProject.id,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: user.uid
        }
      );
      navigate('/features');
    } catch (error) {
      console.error('Error adding feature:', error);
      setIsSubmitting(false);
    }
  };

  if (!currentProject) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center card p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Select a Project
          </h1>
          <p className="text-gray-600 mb-6">
            Please select a project before submitting a feature request
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center card p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Sign in required
          </h1>
          <p className="text-gray-600 mb-6">
            Please sign in to submit a feature request
          </p>
          <button
            onClick={() => navigate('/login')}
            className="btn-primary"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to features
      </button>

      <div className="card">
        <div className="card-header">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Submit a Feature Request
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Share your ideas to help improve {currentProject.name}
            </p>
          </div>
        </div>

        <div className="card-body">
          <FeatureForm
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </div>
  );
}