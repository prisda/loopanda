import { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Loader2 } from 'lucide-react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ProjectCategory } from '../types';
import { DEFAULT_CATEGORIES } from '../constants/categories';
import { useProject } from '../contexts/ProjectContext';
import { uploadImage } from '../utils/imageProcessing';

interface FeatureFormProps {
  onSubmit: (data: FormData, images: string[]) => Promise<void>;
  isSubmitting: boolean;
}

export function FeatureForm({ onSubmit, isSubmitting }: FeatureFormProps) {
  const { currentProject } = useProject();
  const [categories, setCategories] = useState<ProjectCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingImages, setUploadingImages] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      if (!currentProject?.id) {
        setLoading(false);
        return;
      }

      try {
        const categoriesRef = collection(db, 'projects', currentProject.id, 'categories');
        const categoriesSnap = await getDocs(query(categoriesRef, orderBy('order')));
        const categoriesData = categoriesSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as ProjectCategory[];

        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Fall back to default categories
        setCategories(DEFAULT_CATEGORIES.map((cat, index) => ({
          id: String(index),
          ...cat,
          order: index,
          projectId: currentProject.id
        })));
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [currentProject?.id]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const uploading = acceptedFiles.map(file => file.name);
    setUploadingImages(prev => [...prev, ...uploading]);

    try {
      const uploadedUrls = await Promise.all(
        acceptedFiles.map(file => uploadImage(file, 'feature'))
      );
      setImages(prev => [...prev, ...uploadedUrls]);
    } catch (error) {
      console.error('Error uploading images:', error);
    } finally {
      setUploadingImages(prev => prev.filter(name => !uploading.includes(name)));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
    },
    maxFiles: 5,
    maxSize: 5242880, // 5MB
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await onSubmit(formData, images);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-10 bg-gray-200 rounded"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Title
        </label>
        <input
          type="text"
          id="title"
          name="title"
          required
          className="input-primary"
          placeholder="Enter a descriptive title"
        />
      </div>

      <div>
        <label
          htmlFor="category"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Category
        </label>
        <select
          id="category"
          name="category"
          className="input-primary"
          required
        >
          {categories.map((cat) => (
            <option key={cat.id} value={cat.name}>
              {cat.name}
            </option>
          ))}
        </select>
        <p className="mt-1 text-sm text-gray-500">
          {categories.find(cat => cat.name === (document.getElementById('category') as HTMLSelectElement)?.value)?.description}
        </p>
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={6}
          required
          className="input-primary"
          placeholder="Describe your feature request in detail..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Attachments (Optional)
        </label>
        <div
          {...getRootProps()}
          className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-xl ${
            isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
          }`}
        >
          <div className="space-y-2 text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="flex text-sm text-gray-600">
              <input {...getInputProps()} />
              <p>
                <span className="text-blue-600 hover:text-blue-500">
                  Upload images
                </span>{' '}
                or drag and drop
              </p>
            </div>
            <p className="text-xs text-gray-500">
              PNG, JPG, GIF up to 5MB (max 5 images)
            </p>
          </div>
        </div>
      </div>

      {/* Uploading Images */}
      {uploadingImages.length > 0 && (
        <div className="space-y-2">
          {uploadingImages.map((filename, index) => (
            <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Uploading {filename}...</span>
            </div>
          ))}
        </div>
      )}

      {/* Uploaded Images */}
      {images.length > 0 && (
        <div className="space-y-4">
          {images.map((url, index) => (
            <div key={index} className="relative">
              <img
                src={url}
                alt=""
                className="w-full rounded-lg"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting || uploadingImages.length > 0}
          className="btn-primary"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Feature Request'}
        </button>
      </div>
    </form>
  );
}