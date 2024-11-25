import { clsx } from 'clsx';
import { useLayoutStore } from '../../store/layoutStore';
import { LayoutGrid, List } from 'lucide-react';

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export function CategoryFilter({ categories, selectedCategory, onCategoryChange }: CategoryFilterProps) {
  const { filterLayout, setFilterLayout } = useLayoutStore();

  return (
    <div className={clsx(
      'bg-white rounded-lg shadow-sm',
      filterLayout === 'horizontal' ? 'p-4' : 'p-6'
    )}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-700">Categories</h3>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setFilterLayout('horizontal')}
            className={clsx(
              'p-1.5 rounded-lg transition-colors',
              filterLayout === 'horizontal'
                ? 'bg-brand text-white'
                : 'text-gray-500 hover:bg-gray-100'
            )}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setFilterLayout('vertical')}
            className={clsx(
              'p-1.5 rounded-lg transition-colors',
              filterLayout === 'vertical'
                ? 'bg-brand text-white'
                : 'text-gray-500 hover:bg-gray-100'
            )}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className={clsx(
        'flex gap-2',
        filterLayout === 'horizontal' ? 'flex-row flex-wrap' : 'flex-col'
      )}>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={clsx(
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              selectedCategory === category
                ? 'bg-brand text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
              filterLayout === 'vertical' && 'justify-start text-left'
            )}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
}