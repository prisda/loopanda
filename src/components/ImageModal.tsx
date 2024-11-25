import { Dialog } from '@headlessui/react';
import { X } from 'lucide-react';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
}

export function ImageModal({ isOpen, onClose, imageUrl }: ImageModalProps) {
  return (
    <Dialog 
      open={isOpen} 
      onClose={onClose}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/80" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="relative max-w-4xl w-full">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white hover:text-gray-300 rounded-full bg-black/20 hover:bg-black/40 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={imageUrl}
            alt=""
            className="w-full h-auto rounded-lg"
          />
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}