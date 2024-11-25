import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { ImageUpload } from './ImageUpload';
import { Camera } from 'lucide-react';

export function ProfileImageUpload() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  const handleUpload = async (url: string) => {
    if (!user) return;

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        photoURL: url,
        updatedAt: new Date()
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile image:', error);
    }
  };

  if (!user) return null;

  return (
    <div className="relative">
      {user.photoURL && !isEditing ? (
        <div className="relative">
          <img
            src={user.photoURL}
            alt={user.displayName}
            className="w-32 h-32 rounded-full object-cover"
          />
          <button
            onClick={() => setIsEditing(true)}
            className="absolute bottom-0 right-0 p-2 bg-white text-gray-600 rounded-full shadow-md hover:bg-gray-50 transition-colors"
          >
            <Camera className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <div className="w-32">
          <ImageUpload
            onUpload={handleUpload}
            currentImage={user.photoURL}
            type="profile"
          />
        </div>
      )}
    </div>
  );
}