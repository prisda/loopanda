import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, doc, updateDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { useProject } from '../contexts/ProjectContext';
import { ImageUpload } from '../components/ImageUpload';
import { Layout, ArrowRight } from 'lucide-react';
import { DEFAULT_CATEGORIES } from '../constants/categories';

export function ProjectSetupPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setCurrentProject, setIsNewProject } = useProject();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logo, setLogo] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.ownedProjects?.length > 0) {
      navigate('/features');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || isSubmitting) return;

    const formData = new FormData(e.currentTarget);
    setIsSubmitting(true);
    setError('');

    try {
      const batch = writeBatch(db);

      // Create project
      const projectRef = await addDoc(collection(db, 'projects'), {
        name: formData.get('name'),
        description: formData.get('description'),
        website: formData.get('website'),
        logo,
        ownerId: user.uid,
        members: {
          [user.uid]: {
            role: 'owner',
            joinedAt: serverTimestamp()
          }
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        settings: {
          allowAnonymousVoting: false,
          requireApproval: true,
          requireCommentApproval: true
        }
      });

      // Add default categories
      const categoriesRef = collection(db, 'projects', projectRef.id, 'categories');
      await Promise.all(DEFAULT_CATEGORIES.map((category, index) => 
        addDoc(categoriesRef, {
          ...category,
          order: index,
          projectId: projectRef.id,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        })
      ));

      // Update user's owned projects
      await updateDoc(doc(db, 'users', user.uid), {
        ownedProjects: [projectRef.id],
        isAdmin: true,
        updatedAt: serverTimestamp()
      });

      const newProject = { 
        id: projectRef.id, 
        name: formData.get('name'),
        description: formData.get('description'),
        website: formData.get('website'),
        logo,
        ownerId: user.uid,
        members: {
          [user.uid]: {
            role: 'owner',
            joinedAt: new Date()
          }
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        settings: {
          allowAnonymousVoting: false,
          requireApproval: true,
          requireCommentApproval: true
        }
      };

      setCurrentProject(newProject);
      setIsNewProject(true);
      navigate('/features');
    } catch (error: any) {
      console.error('Error creating project:', error);
      setError(
        error.code === 'permission-denied' 
          ? 'You need to be signed in to create a project. Please sign in and try again.'
          : 'Failed to create project. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <Layout className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to FeatureFlow</h1>
          <p className="text-gray-600">Let's set up your project to start collecting feedback</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Logo
                </label>
                <ImageUpload
                  onUpload={setLogo}
                  currentImage={logo}
                  type="profile"
                />
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Project Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="My Awesome Project"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  required
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Tell us about your project..."
                />
              </div>

              <div>
                <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                  Website (Optional)
                </label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://example.com"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4">
              {error}
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Creating Project...' : 'Create Project'}
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}