import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Feature } from '../types';
import { useAuth } from '../hooks/useAuth';
import { useProject } from '../contexts/ProjectContext';
import { ProjectMetrics } from '../components/ProjectMetrics';
import { ProjectVotesChart } from '../components/charts/ProjectVotesChart';
import { ProjectStatusChart } from '../components/charts/ProjectStatusChart';
import { ProjectActivityChart } from '../components/charts/ProjectActivityChart';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorAlert } from '../components/ErrorAlert';

export function AdminProjectDashboard() {
  const { user } = useAuth();
  const { currentProject } = useProject();
  const navigate = useNavigate();
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.isAdmin || !currentProject?.id) {
      setLoading(false);
      return;
    }

    const fetchProjectData = async () => {
      try {
        setError(null);
        
        // Fetch features from project's features subcollection
        const featuresRef = collection(db, 'projects', currentProject.id, 'features');
        const featuresQuery = query(featuresRef, orderBy('createdAt', 'desc'));
        const featuresSnap = await getDocs(featuresQuery);
        
        const featuresData = featuresSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          projectId: currentProject.id
        })) as Feature[];

        setFeatures(featuresData);
      } catch (err: any) {
        console.error('Error fetching project data:', err);
        setError(err.message || 'Failed to load project data');
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [currentProject?.id, user]);

  if (!user?.isAdmin || !currentProject) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {!user?.isAdmin ? 'Admin Access Required' : 'No Project Selected'}
          </h2>
          <p className="text-gray-600">
            {!user?.isAdmin 
              ? 'You need admin privileges to access this page.'
              : 'Please select a project to view analytics.'}
          </p>
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
      <div className="max-w-7xl mx-auto px-4 py-8">
        <ErrorAlert 
          message={error}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {currentProject.name}
            <span className="text-gray-500 font-normal ml-2">/ Analytics</span>
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Project overview and performance metrics
          </p>
        </div>
      </div>

      {/* Project Metrics */}
      <ProjectMetrics project={currentProject} features={features} />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <ProjectActivityChart features={features} />
        <ProjectVotesChart features={features} />
      </div>

      {/* Status Distribution */}
      <div className="mt-8">
        <ProjectStatusChart features={features} />
      </div>
    </div>
  );
}