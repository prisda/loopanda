import { Dialog } from '@headlessui/react';
import { X } from 'lucide-react';
import { ImageUpload } from './ImageUpload';
import { useAuth } from '../hooks/useAuth';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface ProfileImageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileImageModal({ isOpen, onClose }: ProfileImageModalProps) {
  const { user } = useAuth();

  const handleUpload = async (url: string) => {
    if (!user) return;

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        photoURL: url,
        updatedAt: new Date()
      });
      onClose();
    } catch (error) {
      console.error('Error updating profile image:', error);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-lg font-semibold text-gray-900">
              Update Profile Picture
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <ImageUpload
            onUpload={handleUpload}
            currentImage={user?.photoURL}
            type="profile"
          />
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}