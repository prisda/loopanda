import { useFirestore } from '../contexts/FirestoreProvider';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

export function ConnectionStatus() {
  const { isOnline, retry } = useFirestore();

  if (isOnline) {
    return (
      <div className="flex items-center text-green-600">
        <Wifi className="w-4 h-4 mr-1" />
        <span className="text-sm">Connected</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center text-yellow-600">
        <WifiOff className="w-4 h-4 mr-1" />
        <span className="text-sm">Offline</span>
      </div>
      <button
        onClick={() => retry()}
        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
        title="Retry connection"
      >
        <RefreshCw className="w-4 h-4 text-gray-600" />
      </button>
    </div>
  );
}