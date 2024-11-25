import { Search } from 'lucide-react';

interface FeatureSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function FeatureSearch({ value, onChange }: FeatureSearchProps) {
  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search features..."
        className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent"
      />
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
    </div>
  );
}