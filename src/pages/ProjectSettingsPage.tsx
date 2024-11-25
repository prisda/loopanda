import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { useProject } from '../contexts/ProjectContext';
import { ImageUpload } from '../components/ImageUpload';
import { Settings, AlertTriangle } from 'lucide-react';
import { CategoryManager } from '../components/CategoryManager';
import { ProjectCategory } from '../types';
import { Dialog } from '@headlessui/react';
import { ColorPicker } from '../components/ColorPicker';
import { ThemeSelector } from '../components/ThemeSelector';
import { findClosestTheme } from '../utils/themeUtils';

export function ProjectSettingsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentProject, setCurrentProject, updateBrandColor } = useProject();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logo, setLogo] = useState(currentProject?.logo || '');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [categories, setCategories] = useState<ProjectCategory[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [brandColor, setBrandColor] = useState(currentProject?.settings?.brandColor || '#3B82F6');
  const [theme, setTheme] = useState(currentProject?.settings?.theme || 'light');

  useEffect(() => {
    const checkAccess = async () => {
      if (!user || !currentProject?.id) {
        setLoading(false);
        return;
      }

      try {
        // Check if user is project owner or admin
        const isOwner = currentProject.ownerId === user.uid;
        const isAdmin = currentProject.members?.[user.uid]?.role === 'admin';

        if (!isOwner && !isAdmin) {
          setHasAccess(false);
          setLoading(false);
          return;
        }

        setHasAccess(true);
        setLoading(false);
      } catch (error) {
        console.error('Error checking access:', error);
        setError('Failed to verify access permissions');
        setLoading(false);
      }
    };

    checkAccess();
  }, [currentProject?.id, user]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentProject || isSubmitting || !hasAccess) return;

    const formData = new FormData(e.currentTarget);
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const projectRef = doc(db, 'projects', currentProject.id);
      const updatedData = {
        name: formData.get('name'),
        description: formData.get('description'),
        website: formData.get('website'),
        logo,
        updatedAt: serverTimestamp(),
        settings: {
          ...currentProject.settings,
          brandColor,
          theme,
          allowAnonymousVoting: formData.get('allowAnonymousVoting') === 'true',
          requireApproval: formData.get('requireApproval') === 'true',
          requireCommentApproval: formData.get('requireCommentApproval') === 'true'
        }
      };

      await updateDoc(projectRef, updatedData);
      await updateBrandColor(brandColor);
      
      setCurrentProject({ ...currentProject, ...updatedData });
      setSuccess('Settings updated successfully');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Error updating project:', error);
      setError('Failed to update settings');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBrandColorChange = (color: string) => {
    setBrandColor(color);
    // Find and set the closest matching theme
    const closestTheme = findClosestTheme(color);
    setTheme(closestTheme);
    // Update the preview immediately
    document.documentElement.setAttribute('data-theme', closestTheme);
  };

  const handleDelete = async () => {
    if (!currentProject || deleteConfirmText !== currentProject.name || !hasAccess) return;

    try {
      const projectRef = doc(db, 'projects', currentProject.id);
      await updateDoc(projectRef, {
        deleted: true,
        deletedAt: serverTimestamp()
      });
      navigate('/admin/projects');
    } catch (error) {
      console.error('Error deleting project:', error);
      setError('Failed to delete project');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!currentProject) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Project Selected</h2>
          <p className="text-gray-600">Please select a project to manage its settings.</p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">
            You need to be the project owner or admin to access these settings.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">
        {currentProject.name}
        <span className="text-gray-500 font-normal ml-2">/ Settings</span>
      </h1>

      {success && (
        <div className="mb-6 p-3 bg-green-50 border border-green-200 text-green-600 rounded-lg text-sm">
          {success}
        </div>
      )}

      {error && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Project Info Card */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Information</h3>
          
          <div className="grid gap-6">
            <div className="flex items-start gap-6">
              <div className="w-24">
                <ImageUpload
                  onUpload={setLogo}
                  currentImage={logo}
                  type="profile"
                />
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={currentProject.name}
                    required
                    className="input-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    rows={2}
                    defaultValue={currentProject.description}
                    required
                    className="input-primary"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
              <input
                type="url"
                name="website"
                defaultValue={currentProject.website}
                className="input-primary"
                placeholder="https://example.com"
              />
            </div>

            <div className="space-y-6">
              <ColorPicker
                label="Brand Color"
                value={brandColor}
                onChange={handleBrandColorChange}
              />

              <ThemeSelector
                value={theme}
                onChange={setTheme}
              />
            </div>
          </div>
        </div>

        {/* Categories Card */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <CategoryManager
            projectId={currentProject.id}
            categories={categories}
            onCategoriesChange={setCategories}
          />
        </div>

        {/* Settings Card */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Settings</h3>
          
          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <div>
                <span className="text-sm text-gray-700">Allow Anonymous Voting</span>
                <p className="text-xs text-gray-500">Let users vote without signing in</p>
              </div>
              <input
                type="checkbox"
                name="allowAnonymousVoting"
                defaultChecked={currentProject.settings.allowAnonymousVoting}
                value="true"
                className="rounded border-gray-300 text-brand focus:ring-brand"
              />
            </label>

            <label className="flex items-center justify-between">
              <div>
                <span className="text-sm text-gray-700">Require Feature Approval</span>
                <p className="text-xs text-gray-500">Review features before they are published</p>
              </div>
              <input
                type="checkbox"
                name="requireApproval"
                defaultChecked={currentProject.settings.requireApproval}
                value="true"
                className="rounded border-gray-300 text-brand focus:ring-brand"
              />
            </label>

            <label className="flex items-center justify-between">
              <div>
                <span className="text-sm text-gray-700">Require Comment Approval</span>
                <p className="text-xs text-gray-500">Review comments before they are published</p>
              </div>
              <input
                type="checkbox"
                name="requireCommentApproval"
                defaultChecked={currentProject.settings.requireCommentApproval}
                value="true"
                className="rounded border-gray-300 text-brand focus:ring-brand"
              />
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary"
          >
            {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
          </button>
        </div>

        {/* Danger Zone - Only show to project owner */}
        {currentProject.ownerId === user?.uid && (
          <div className="bg-red-50 rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <h3 className="text-lg font-semibold text-red-900">Danger Zone</h3>
            </div>

            <p className="text-sm text-red-600 mb-4">
              Once you delete a project, there is no going back. Please be certain.
            </p>

            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Delete Project
            </button>
          </div>
        )}
      </form>

      {/* Delete Confirmation Modal */}
      <Dialog 
        open={showDeleteConfirm} 
        onClose={() => setShowDeleteConfirm(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
            <Dialog.Title className="text-lg font-semibold text-gray-900 mb-4">
              Delete Project
            </Dialog.Title>

            <p className="text-sm text-gray-600 mb-4">
              This action cannot be undone. This will permanently delete the project
              <span className="font-semibold"> {currentProject.name}</span>.
            </p>

            <p className="text-sm text-gray-600 mb-4">
              Please type <span className="font-semibold">{currentProject.name}</span> to confirm.
            </p>

            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              className="input-primary mb-4"
              placeholder="Type project name to confirm"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteConfirmText !== currentProject.name}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                Delete Project
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}