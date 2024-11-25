import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useProject } from '../contexts/ProjectContext';
import { User } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorAlert } from '../components/ErrorAlert';
import { UserThumbnail } from '../components/UserThumbnail';
import { formatDate } from '../utils/date';

export function AdminUsersPage() {
  const { user } = useAuth();
  const { currentProject } = useProject();
  const navigate = useNavigate();
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMembers = async () => {
      if (!user?.isAdmin || !currentProject?.id) {
        setLoading(false);
        return;
      }

      try {
        setError(null);
        
        // Get all member IDs from the project's members object
        const memberIds = Object.keys(currentProject.members || {});
        
        if (memberIds.length === 0) {
          setMembers([]);
          setLoading(false);
          return;
        }

        // Fetch user documents for each member
        const memberPromises = memberIds.map(async (userId) => {
          const userDoc = await getDoc(doc(db, 'users', userId));
          if (!userDoc.exists()) return null;
          
          return {
            id: userDoc.id,
            ...userDoc.data(),
            role: currentProject.members[userId].role,
            joinedAt: currentProject.members[userId].joinedAt
          } as User;
        });

        const membersData = (await Promise.all(memberPromises))
          .filter((member): member is User => member !== null);

        setMembers(membersData);
        setError(null);
      } catch (err) {
        console.error('Error fetching members:', err);
        setError('Failed to load team members. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [user, currentProject?.id, navigate]);

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
              : 'Please select a project to manage team members.'}
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

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {currentProject.name}
            <span className="text-gray-500 font-normal ml-2">/ Team Members</span>
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage your project team members and their roles
          </p>
        </div>
      </div>

      {error && (
        <ErrorAlert 
          message={error}
          onRetry={() => window.location.reload()}
        />
      )}

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Active
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {members.map(member => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <UserThumbnail user={member} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize">
                      {member.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(member.joinedAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {member.lastLogin ? formatDate(member.lastLogin) : 'Never'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}