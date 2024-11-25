import { clsx } from 'clsx';
import { useNavigate } from 'react-router-dom';

interface CategoryBadgeProps {
  category: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  'UI/UX': 'category-tag-ui',
  'Feature': 'category-tag-feature',
  'Bug': 'category-tag-bug',
  'Enhancement': 'category-tag-enhancement',
  'Documentation': 'category-tag-documentation'
};

export function CategoryBadge({ category, size = 'md', className = '' }: CategoryBadgeProps) {
  const navigate = useNavigate();
  const colorClass = CATEGORY_COLORS[category] || 'category-tag-other';
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/features?category=${encodeURIComponent(category)}`);
  };
  
  return (
    <button
      onClick={handleClick}
      className={clsx(
        'category-tag',
        colorClass,
        {
          'px-2 py-1 text-xs': size === 'sm',
          'px-3 py-1.5 text-sm': size === 'md',
          'px-4 py-2 text-base': size === 'lg'
        },
        className
      )}
    >
      {category}
    </button>
  );
}