import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../lib/firebase';

const MAX_WIDTH = 800;
const MAX_HEIGHT = 800;
const QUALITY = 0.8;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

async function resizeImage(file: File): Promise<Blob> {
  if (file.size <= MAX_FILE_SIZE && file.type === 'image/webm') {
    return file;
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    img.onload = () => {
      let width = img.width;
      let height = img.height;

      // Calculate new dimensions
      if (width > height) {
        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width = Math.round((width * MAX_HEIGHT) / height);
          height = MAX_HEIGHT;
        }
      }

      // Create canvas
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress image
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to WebM
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Could not create blob'));
          }
        },
        'image/webm',
        QUALITY
      );
    };

    img.onerror = () => {
      reject(new Error('Could not load image'));
    };

    reader.readAsDataURL(file);
  });
}

function generateFilePath(type: 'profile' | 'feature', originalName: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const extension = 'webm';
  
  const date = new Date();
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  
  return `${type}/${year}/${month}/${day}/${timestamp}-${randomString}.${extension}`;
}

export async function uploadImage(
  file: File,
  type: 'profile' | 'feature'
): Promise<string> {
  try {
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      throw new Error('File size exceeds 5MB limit');
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image');
    }

    // Process and resize image
    const processedBlob = await resizeImage(file);
    
    // Generate organized file path
    const filePath = generateFilePath(type, file.name);
    const storageRef = ref(storage, filePath);
    
    // Upload with metadata
    const metadata = {
      contentType: 'image/webm',
      customMetadata: {
        originalName: file.name,
        uploadedAt: new Date().toISOString()
      }
    };
    
    // Upload processed image
    const snapshot = await uploadBytes(storageRef, processedBlob, metadata);
    
    // Get and return download URL
    return await getDownloadURL(snapshot.ref);
  } catch (error) {
    console.error('Error processing and uploading image:', error);
    throw error;
  }
}