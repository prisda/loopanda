import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, useParams } from 'react-router-dom';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Feature, User } from '../types';
import { FeatureCard } from '../components/FeatureCard';
import { Settings, User as UserIcon } from 'lucide-react';
import { ProfileImageModal } from '../components/ProfileImageModal';
import { Pagination } from '../components/Pagination';
import { useProject } from '../contexts/ProjectContext';

const ITEMS_PER_PAGE = 5;

export function ProfilePage() {
  const { user } = useAuth();
  const { currentProject } = useProject();
  const { userId } = useParams(); // Get userId from URL
  const navigate = useNavigate();
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [userFeatures, setUserFeatures] = useState<Feature[]>([]);
  const [votedFeatures, setVotedFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submissionsPage, setSubmissionsPage] = useState(1);
  const [votesPage, setVotesPage] = useState(1);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentProject?.id) {
        setLoading(false);
        return;
      }

      try {
        setError(null);
        
        // Get user data
        const targetUserId = userId || user?.uid;
        if (!targetUserId) {
          navigate('/login');
          return;
        }

        const userDoc = await getDoc(doc(db, 'users', targetUserId));
        if (!userDoc.exists()) {
          setError('User not found');
          return;
        }

        const userData = userDoc.data() as User;
        setProfileUser(userData);
        
        // Fetch features created by user
        const createdQuery = query(
          collection(db, 'projects', currentProject.id, 'features'),
          where('createdBy', '==', targetUserId)
        );
        const createdSnapshot = await getDocs(createdQuery);
        const createdFeatures = createdSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          projectId: currentProject.id
        })) as Feature[];

        // Fetch features voted by user
        const votedQuery = query(
          collection(db, 'projects', currentProject.id, 'features'),
          where('votedBy', 'array-contains', targetUserId)
        );
        const votedSnapshot = await getDocs(votedQuery);
        const votedFeatures = votedSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          projectId: currentProject.id
        })) as Feature[];

        setUserFeatures(createdFeatures);
        setVotedFeatures(votedFeatures);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Failed to load user data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user, userId, currentProject?.id, navigate]);

  const paginatedSubmissions = userFeatures.slice(
    (submissionsPage - 1) * ITEMS_PER_PAGE,
    submissionsPage * ITEMS_PER_PAGE
  );

  const paginatedVotes = votedFeatures.slice(
    (votesPage - 1) * ITEMS_PER_PAGE,
    votesPage * ITEMS_PER_PAGE
  );

  const submissionPages = Math.ceil(userFeatures.length / ITEMS_PER_PAGE);
  const votePages = Math.ceil(votedFeatures.length / ITEMS_PER_PAGE);

  if (!currentProject) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Project Selected</h2>
          <p className="text-gray-600">Please select a project to view profiles.</p>
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

  if (!profileUser) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">User Not Found</h2>
          <p className="text-gray-600">The requested user profile could not be found.</p>
        </div>
      </div>
    );
  }

  const isOwnProfile = user?.uid === profileUser.uid;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => isOwnProfile && setIsModalOpen(true)}
              className={`relative group ${isOwnProfile ? 'cursor-pointer' : 'cursor-default'}`}
            >
              {profileUser.photoURL ? (
                <img 
                  src={profileUser.photoURL} 
                  alt={profileUser.displayName}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center">
                  <UserIcon className="w-8 h-8 text-gray-400" />
                </div>
              )}
              {isOwnProfile && (
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all flex items-center justify-center">
                  <span className="text-white opacity-0 group-hover:opacity-100 text-xs font-medium">
                    Change
                  </span>
                </div>
              )}
            </button>

            <div>
              <h1 className="text-xl font-bold text-gray-900">{profileUser.displayName}</h1>
              <p className="text-sm text-gray-600">{profileUser.email}</p>
              {profileUser.isAdmin && (
                <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                  Admin
                </span>
              )}
            </div>
          </div>

          {isOwnProfile && (
            <button className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100">
              <Settings className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-sm text-gray-600">Submitted</div>
            <div className="text-2xl font-bold text-blue-600">{userFeatures.length}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-sm text-gray-600">Voted</div>
            <div className="text-2xl font-bold text-blue-600">{votedFeatures.length}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-sm text-gray-600">Role</div>
            <div className="text-2xl font-bold text-blue-600 capitalize">
              {currentProject.members[profileUser.uid]?.role || 'Member'}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 mb-6 text-sm">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Submissions</h2>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : paginatedSubmissions.length > 0 ? (
            <>
              <div className="space-y-4 mb-4">
                {paginatedSubmissions.map(feature => (
                  <FeatureCard
                    key={feature.id}
                    feature={feature}
                    commentCount={0}
                  />
                ))}
              </div>
              <Pagination
                currentPage={submissionsPage}
                totalPages={submissionPages}
                onPageChange={setSubmissionsPage}
              />
            </>
          ) : (
            <p className="text-gray-600 text-sm text-center py-8">No submissions yet</p>
          )}
        </div>

        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Voted Features</h2>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : paginatedVotes.length > 0 ? (
            <>
              <div className="space-y-4 mb-4">
                {paginatedVotes.map(feature => (
                  <FeatureCard
                    key={feature.id}
                    feature={feature}
                    commentCount={0}
                  />
                ))}
              </div>
              <Pagination
                currentPage={votesPage}
                totalPages={votePages}
                onPageChange={setVotesPage}
              />
            </>
          ) : (
            <p className="text-gray-600 text-sm text-center py-8">No votes yet</p>
          )}
        </div>
      </div>

      {isOwnProfile && (
        <ProfileImageModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}