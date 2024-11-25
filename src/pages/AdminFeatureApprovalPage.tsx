import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Feature } from '../types';
import { Check, X, MessageSquare, Filter } from 'lucide-react';
import { CategoryBadge } from '../components/CategoryBadge';
import { formatDate } from '../utils/date';
import { useProject } from '../contexts/ProjectContext';
import { DatePeriodPicker } from '../components/DatePeriodPicker';
import { startOfDay, endOfDay, subDays } from 'date-fns';

export function AdminFeatureApprovalPage() {
  const { user } = useAuth();
  const { currentProject } = useProject();
  const navigate = useNavigate();
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [dateRange, setDateRange] = useState({
    start: startOfDay(subDays(new Date(), 29)), // Default to last month
    end: endOfDay(new Date())
  });

  useEffect(() => {
    if (!user?.isAdmin || !currentProject?.id) {
      navigate('/');
      return;
    }

    const fetchFeatures = async () => {
      try {
        const q = query(
          collection(db, 'projects', currentProject.id, 'features'),
          where('status', '==', 'under-review')
        );
        const snapshot = await getDocs(q);
        const featuresData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          projectId: currentProject.id
        })) as Feature[];
        setFeatures(featuresData);
      } catch (error) {
        console.error('Error fetching features:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatures();
  }, [user, currentProject?.id, navigate]);

  const handleApprove = async (featureId: string) => {
    if (processingId || !currentProject) return;
    setProcessingId(featureId);

    try {
      const featureRef = doc(db, 'projects', currentProject.id, 'features', featureId);
      await updateDoc(featureRef, {
        status: 'planned',
        updatedAt: new Date()
      });
      setFeatures(features.filter(f => f.id !== featureId));
    } catch (error) {
      console.error('Error approving feature:', error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (featureId: string) => {
    if (processingId || !currentProject) return;
    if (!window.confirm('Are you sure you want to reject this feature request?')) return;

    setProcessingId(featureId);
    try {
      await deleteDoc(doc(db, 'projects', currentProject.id, 'features', featureId));
      setFeatures(features.filter(f => f.id !== featureId));
    } catch (error) {
      console.error('Error rejecting feature:', error);
    } finally {
      setProcessingId(null);
    }
  };

  // Filter features by date and category
  const filteredFeatures = features.filter(feature => {
    const featureDate = feature.createdAt.toDate();
    const matchesDate = featureDate >= dateRange.start && featureDate <= dateRange.end;
    const matchesCategory = selectedCategory === 'All' || feature.category === selectedCategory;
    return matchesDate && matchesCategory;
  });

  if (!user?.isAdmin || !currentProject) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {!user?.isAdmin ? 'Admin Access Required' : 'No Project Selected'}
          </h2>
          <p className="text-gray-600">
            {!user?.isAdmin 
              ? 'You need admin privileges to access this page.'
              : 'Please select a project to manage feature approvals.'}
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {currentProject.name}
          <span className="text-gray-500 font-normal ml-2">/ Feature Approval</span>
        </h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </button>
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
            {filteredFeatures.length} pending
          </span>
        </div>
      </div>

      {showFilters && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Range
              </label>
              <DatePeriodPicker
                value={dateRange}
                onChange={setDateRange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categories
              </label>
              <div className="flex flex-wrap gap-2">
                {['All', ...new Set(features.map(f => f.category))].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategory === cat
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {filteredFeatures.length > 0 ? (
        <div className="space-y-4">
          {filteredFeatures.map(feature => (
            <div key={feature.id} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-medium text-gray-900">{feature.title}</h3>
                    <CategoryBadge category={feature.category} size="sm" />
                  </div>
                  <p className="text-gray-600 whitespace-pre-wrap mb-4">
                    {feature.description}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>Submitted {formatDate(feature.createdAt)}</span>
                    <span className="flex items-center">
                      <MessageSquare className="w-4 h-4 mr-1" />
                      {feature.votes || 0} votes
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleApprove(feature.id)}
                    disabled={processingId === feature.id}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Approve feature"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleReject(feature.id)}
                    disabled={processingId === feature.id}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Reject feature"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No pending features to review</p>
        </div>
      )}
    </div>
  );
}