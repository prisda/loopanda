import { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Feature } from '../types';
import { Plus, Filter } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { useFilterStore } from '../store/filterStore';
import { useProject } from '../contexts/ProjectContext';
import { Pagination } from '../components/Pagination';
import { DEFAULT_CATEGORIES } from '../constants/categories';
import { CategoryFilter } from '../components/features/CategoryFilter';
import { FeatureSearch } from '../components/features/FeatureSearch';
import { DensitySelector } from '../components/features/DensitySelector';
import { FeatureCard } from '../components/features/FeatureCard';
import { useLayoutStore } from '../store/layoutStore';
import { clsx } from 'clsx';

const ITEMS_PER_PAGE = 10;

export function FeaturesPage() {
  const { currentProject } = useProject();
  const { sortBy, setSortBy } = useFilterStore();
  const { filterLayout } = useLayoutStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get('category') || 'All';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!currentProject?.id) {
        setLoading(false);
        return;
      }

      try {
        const featuresRef = collection(db, 'projects', currentProject.id, 'features');
        const featuresSnap = await getDocs(query(
          featuresRef,
          orderBy(sortBy === 'top' ? 'votes' : 'createdAt', 'desc')
        ));

        const featuresData = featuresSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          projectId: currentProject.id
        })) as Feature[];

        setFeatures(featuresData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentProject?.id, sortBy]);

  const availableCategories = ['All', ...DEFAULT_CATEGORIES.map(cat => cat.name)];

  const filteredFeatures = features
    .filter(feature => {
      const matchesCategory = category === 'All' || feature.category === category;
      const matchesSearch = !searchTerm || 
        feature.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        feature.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });

  const totalPages = Math.ceil(filteredFeatures.length / ITEMS_PER_PAGE);
  const paginatedFeatures = filteredFeatures.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const handlePageChange = (newPage: number) => {
    setSearchParams({ category, page: newPage.toString() });
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {currentProject?.name}
            <span className="text-gray-500 font-normal ml-2">/ Features</span>
          </h1>
          <div className="flex items-center gap-4">
            <DensitySelector />
            <Link
              to="/new"
              className="btn-primary flex items-center text-sm"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              New Request
            </Link>
          </div>
        </div>

        <div className={clsx(
          'grid gap-6',
          filterLayout === 'vertical' ? 'grid-cols-[280px,1fr]' : 'grid-cols-1'
        )}>
          <div className={clsx(
            filterLayout === 'vertical' ? 'space-y-6' : ''
          )}>
            <CategoryFilter
              categories={availableCategories}
              selectedCategory={category}
              onCategoryChange={(newCategory) => {
                setSearchParams({ category: newCategory, page: '1' });
              }}
            />

            {filterLayout === 'vertical' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sort By
                    </label>
                    <div className="flex bg-gray-100 rounded-lg p-1">
                      <button
                        onClick={() => setSortBy('top')}
                        className={clsx(
                          'flex-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                          sortBy === 'top'
                            ? 'bg-brand text-white'
                            : 'text-gray-600 hover:bg-gray-200'
                        )}
                      >
                        Most Voted
                      </button>
                      <button
                        onClick={() => setSortBy('latest')}
                        className={clsx(
                          'flex-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                          sortBy === 'latest'
                            ? 'bg-brand text-white'
                            : 'text-gray-600 hover:bg-gray-200'
                        )}
                      >
                        Latest
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <FeatureSearch
                  value={searchTerm}
                  onChange={setSearchTerm}
                />
              </div>

              {filterLayout === 'horizontal' && (
                <div className="flex bg-white rounded-lg p-1 border border-gray-200">
                  <button
                    onClick={() => setSortBy('top')}
                    className={clsx(
                      'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                      sortBy === 'top'
                        ? 'bg-brand text-white'
                        : 'text-gray-600 hover:bg-gray-200'
                    )}
                  >
                    Most Voted
                  </button>
                  <button
                    onClick={() => setSortBy('latest')}
                    className={clsx(
                      'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                      sortBy === 'latest'
                        ? 'bg-brand text-white'
                        : 'text-gray-600 hover:bg-gray-200'
                    )}
                  >
                    Latest
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-3">
              {paginatedFeatures.map(feature => (
                <FeatureCard
                  key={feature.id}
                  feature={feature}
                />
              ))}

              {paginatedFeatures.length === 0 && (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No features found
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {searchTerm
                      ? 'Try adjusting your search terms'
                      : category === 'All'
                      ? 'Be the first to submit a feature request!'
                      : 'No features found in this category.'}
                  </p>
                  <Link
                    to="/new"
                    className="btn-primary inline-flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-1.5" />
                    New Request
                  </Link>
                </div>
              )}
            </div>

            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}