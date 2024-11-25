import { Search } from 'lucide-react';
import { DensitySelector } from '../features/DensitySelector';

interface RoadmapFiltersProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  categories: string[];
}

export function RoadmapFilters({
  selectedCategory,
  onCategoryChange,
  searchTerm,
  onSearchChange,
  categories
}: RoadmapFiltersProps) {
  return (
    <div className="space-y-4 mb-6">
      {/* Categories - Horizontal */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => onCategoryChange(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-brand text-white'
                  : 'text-gray-600 hover:bg-gray-100 bg-gray-50'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Search and Density */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search features..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
          <DensitySelector />
        </div>
      </div>
    </div>
  );
}