import { useState, useEffect } from 'react';
import { collection, query, getDocs, orderBy, where, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Feature } from '../types';
import { useProject } from '../contexts/ProjectContext';
import { TopFeatures } from '../components/dashboard/TopFeatures';
import { KeywordCloud } from '../components/dashboard/KeywordCloud';
import { ActivityCalendar } from '../components/dashboard/ActivityCalendar';
import { CategoryRadar } from '../components/dashboard/CategoryRadar';
import { TopContributors } from '../components/dashboard/TopContributors';
import { DashboardMetrics } from '../components/dashboard/DashboardMetrics';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorAlert } from '../components/ErrorAlert';
import { subDays } from 'date-fns';

export function DashboardPage() {
  const { currentProject } = useProject();
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!currentProject?.id) {
        setLoading(false);
        return;
      }

      try {
        // Get features from the last 30 days
        const thirtyDaysAgo = subDays(new Date(), 30);
        const featuresQuery = query(
          collection(db, 'projects', currentProject.id, 'features'),
          where('createdAt', '>=', thirtyDaysAgo),
          orderBy('createdAt', 'desc')
        );

        const snapshot = await getDocs(featuresQuery);
        const featuresData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          projectId: currentProject.id
        })) as Feature[];

        setFeatures(featuresData);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentProject?.id]);

  if (!currentProject) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Project Selected</h2>
          <p className="text-gray-600">Please select a project to view the dashboard.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <ErrorAlert message={error} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {currentProject.name}
            <span className="text-gray-500 font-normal ml-2">/ Dashboard</span>
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Project overview and insights from the last 30 days
          </p>
        </div>
      </div>

      {/* Metrics Overview */}
      <DashboardMetrics features={features} />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Top Features */}
        <TopFeatures features={features} />
        
        {/* Top Contributors */}
        <TopContributors projectId={currentProject.id} />
      </div>

      {/* Secondary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Category Distribution */}
        <CategoryRadar features={features} />
        
        {/* Keyword Cloud */}
        <KeywordCloud features={features} />
        
        {/* Activity Calendar */}
        <ActivityCalendar features={features} />
      </div>
    </div>
  );
}