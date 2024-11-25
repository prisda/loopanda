import { useState, useEffect } from 'react';
import { collection, query, getDocs, orderBy, limit, where, doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { User } from '../../types';
import { Link } from 'react-router-dom';
import { UserThumbnail } from '../UserThumbnail';
import { subDays } from 'date-fns';

interface TopContributorsProps {
  projectId: string;
}

export function TopContributors({ projectId }: TopContributorsProps) {
  const [contributors, setContributors] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContributors = async () => {
      if (!projectId) {
        setLoading(false);
        return;
      }

      try {
        const sevenDaysAgo = subDays(new Date(), 7);
        
        // Get features from the last 7 days
        const featuresQuery = query(
          collection(db, 'projects', projectId, 'features'),
          where('createdAt', '>=', sevenDaysAgo),
          orderBy('createdAt', 'desc')
        );
        
        const featuresSnap = await getDocs(featuresQuery);
        
        // Get unique contributor IDs and their contribution counts
        const contributorStats = featuresSnap.docs.reduce((acc, doc) => {
          const createdBy = doc.data().createdBy;
          acc[createdBy] = (acc[createdBy] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        // Sort by contribution count and take top 5
        const topContributorIds = Object.entries(contributorStats)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([id]) => id);

        // Fetch user details
        const userDocs = await Promise.all(
          topContributorIds.map(uid => 
            getDoc(doc(db, 'users', uid))
          )
        );

        const contributorsData = userDocs
          .filter(doc => doc.exists())
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as User[];

        setContributors(contributorsData);
        setError(null);
      } catch (error) {
        console.error('Error fetching contributors:', error);
        setError('Failed to load contributors');
      } finally {
        setLoading(false);
      }
    };

    fetchContributors();
  }, [projectId]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Contributors</h2>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse flex items-center gap-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full" />
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Contributors</h2>
      
      {error ? (
        <div className="text-center text-red-600 py-4">{error}</div>
      ) : (
        <div className="space-y-4">
          {contributors.map(user => (
            <Link
              key={user.id}
              to={`/profile/${user.id}`}
              className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <UserThumbnail user={user} showMeta={false} />
            </Link>
          ))}

          {contributors.length === 0 && (
            <p className="text-center text-gray-500 py-4">
              No contributions in the last 7 days
            </p>
          )}
        </div>
      )}
    </div>
  );
}