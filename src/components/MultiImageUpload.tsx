import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Loader2 } from 'lucide-react';
import { uploadImage } from '../utils/imageProcessing';

interface MultiImageUploadProps {
  onUpload: (urls: string[]) => void;
  currentImages?: string[];
  maxImages?: number;
}

interface UploadingImage {
  id: string;
  file: File;
  progress: number;
}

export function MultiImageUpload({ 
  onUpload, 
  currentImages = [], 
  maxImages = 5 
}: MultiImageUploadProps) {
  const [uploadingImages, setUploadingImages] = useState<UploadingImage[]>([]);
  const [images, setImages] = useState<string[]>(currentImages);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (files: File[]) => {
    const newUploadingImages = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      progress: 0
    }));

    setUploadingImages(prev => [...prev, ...newUploadingImages]);

    try {
      const uploadPromises = newUploadingImages.map(async (uploadingImage) => {
        // Simulate progress updates
        const progressInterval = setInterval(() => {
          setUploadingImages(prev => prev.map(img => 
            img.id === uploadingImage.id 
              ? { ...img, progress: Math.min(90, img.progress + 10) }
              : img
          ));
        }, 200);

        try {
          const url = await uploadImage(uploadingImage.file, 'feature');
          clearInterval(progressInterval);
          
          setUploadingImages(prev => prev.map(img => 
            img.id === uploadingImage.id 
              ? { ...img, progress: 100 }
              : img
          ));

          return url;
        } catch (error) {
          clearInterval(progressInterval);
          throw error;
        }
      });

      const newUrls = await Promise.all(uploadPromises);
      const updatedImages = [...images, ...newUrls];
      setImages(updatedImages);
      onUpload(updatedImages);
    } catch (error) {
      console.error('Error uploading images:', error);
      setError('Failed to upload one or more images. Please try again.');
    } finally {
      setUploadingImages([]);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const remainingSlots = maxImages - images.length;
    if (remainingSlots <= 0) {
      setError(`Maximum ${maxImages} images allowed`);
      return;
    }

    const filesToUpload = acceptedFiles.slice(0, remainingSlots);
    handleUpload(filesToUpload);
  }, [images.length, maxImages]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
    },
    maxFiles: maxImages - images.length,
    maxSize: 5 * 1024 * 1024, // 5MB
    disabled: uploadingImages.length > 0
  });

  const removeImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    setImages(updatedImages);
    onUpload(updatedImages);
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragActive
            ? 'border-blue-400 bg-blue-50'
            : uploadingImages.length > 0
            ? 'border-gray-200 bg-gray-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${uploadingImages.length > 0 ? 'cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-gray-600 mb-2">
          Drag & drop images here, or click to select
        </p>
        <p className="text-sm text-gray-500">
          PNG, JPG, GIF up to 5MB (max {maxImages} images)
        </p>
        <p className="text-sm text-gray-500 mt-1">
          {images.length} of {maxImages} images used
        </p>
      </div>

      {/* Uploading Progress */}
      {uploadingImages.length > 0 && (
        <div className="space-y-3">
          {uploadingImages.map(img => (
            <div key={img.id} className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{img.file.name}</span>
                  <span className="text-gray-500">{img.progress}%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 transition-all duration-300"
                    style={{ width: `${img.progress}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image Previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {images.map((url, index) => (
            <div key={index} className="relative group">
              <img
                src={url}
                alt=""
                className="w-full h-32 object-cover rounded-lg"
              />
              <button
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 p-1.5 bg-white text-gray-600 rounded-full shadow-md hover:bg-gray-50 transition-colors opacity-0 group-hover:opacity-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}