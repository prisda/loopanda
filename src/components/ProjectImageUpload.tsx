import { useState } from 'react';
import { Camera, Upload, X } from 'lucide-react';
import { ImageUploadModal } from './ImageUploadModal';

interface ProjectImageUploadProps {
  currentImage?: string;
  onUpload: (url: string) => void;
  size?: 'sm' | 'md' | 'lg';
}

export function ProjectImageUpload({ currentImage, onUpload, size = 'md' }: ProjectImageUploadProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  };

  return (
    <>
      <div className="relative inline-block">
        {currentImage ? (
          <div className={`relative ${sizeClasses[size]} rounded-lg overflow-hidden group`}>
            <img
              src={currentImage}
              alt="Project logo"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
              <button
                onClick={() => setIsModalOpen(true)}
                className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Camera className="w-5 h-5" />
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsModalOpen(true)}
            className={`${sizeClasses[size]} flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors`}
          >
            <Upload className="w-6 h-6 text-gray-400" />
          </button>
        )}
      </div>

      <ImageUploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpload={(url) => {
          onUpload(url);
          setIsModalOpen(false);
        }}
        currentImage={currentImage}
        type="profile"
      />
    </>
  );
}