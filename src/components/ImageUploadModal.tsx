import { Dialog } from '@headlessui/react';
import { X, Upload } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { useState, useCallback } from 'react';
import { uploadImage } from '../utils/imageProcessing';
import { LoadingSpinner } from './LoadingSpinner';

interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (url: string) => void;
  currentImage?: string;
  type?: 'profile' | 'feature';
}

export function ImageUploadModal({ 
  isOpen, 
  onClose, 
  onUpload, 
  currentImage, 
  type = 'feature' 
}: ImageUploadModalProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (file: File) => {
    setUploading(true);
    setError(null);
    
    try {
      const url = await uploadImage(file, type);
      onUpload(url);
      onClose();
    } catch (error: any) {
      console.error('Error uploading image:', error);
      setError(error.message || 'Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      handleUpload(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
    },
    maxFiles: 1,
    maxSize: 5242880, // 5MB
    disabled: uploading
  });

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-lg font-semibold text-gray-900">
              Upload Image
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              disabled={uploading}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          {currentImage && (
            <div className="mb-4">
              <img
                src={currentImage}
                alt="Current"
                className="rounded-lg max-h-48 mx-auto"
              />
            </div>
          )}

          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              isDragActive
                ? 'border-blue-400 bg-blue-50'
                : uploading
                ? 'border-gray-200 bg-gray-50'
                : 'border-gray-300 hover:border-gray-400'
            } ${uploading ? 'cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <input {...getInputProps()} />
            {uploading ? (
              <div className="flex flex-col items-center">
                <LoadingSpinner size="lg" className="text-blue-600 mb-4" />
                <p className="text-gray-600">Uploading...</p>
              </div>
            ) : (
              <>
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600 mb-2">
                  Drag & drop an image here, or click to select
                </p>
                <p className="text-sm text-gray-500">
                  PNG, JPG, GIF up to 5MB
                </p>
              </>
            )}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}