import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { useProject } from '../contexts/ProjectContext';
import { TeamMember } from '../types/team';
import { TeamMembersTable } from '../components/team/TeamMembersTable';
import { TeamMembersToolbar } from '../components/team/TeamMembersToolbar';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorAlert } from '../components/ErrorAlert';

export function TeamMembersPage() {
  const { user } = useAuth();
  const { currentProject } = useProject();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchMembers = async () => {
      if (!currentProject?.id) {
        setLoading(false);
        return;
      }

      try {
        const membersRef = collection(db, 'projects', currentProject.id, 'members');
        const snapshot = await getDocs(membersRef);
        const membersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as TeamMember[];

        setMembers(membersData);
        setError(null);
      } catch (err) {
        console.error('Error fetching members:', err);
        setError('Failed to load team members');
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [currentProject?.id]);

  const handleAddMember = async (member: TeamMember) => {
    if (!currentProject?.id) return;

    try {
      const memberRef = doc(collection(db, 'projects', currentProject.id, 'members'));
      await setDoc(memberRef, {
        ...member,
        createdAt: serverTimestamp()
      });

      setMembers([...members, { ...member, id: memberRef.id }]);
    } catch (err) {
      console.error('Error adding member:', err);
      setError('Failed to add member');
    }
  };

  const handleUpdateMember = async (member: TeamMember) => {
    if (!currentProject?.id) return;

    try {
      const memberRef = doc(db, 'projects', currentProject.id, 'members', member.id);
      await updateDoc(memberRef, {
        ...member,
        updatedAt: serverTimestamp()
      });

      setMembers(members.map(m => m.id === member.id ? member : m));
    } catch (err) {
      console.error('Error updating member:', err);
      setError('Failed to update member');
    }
  };

  const handleDeleteMember = async (memberId: string) => {
    if (!currentProject?.id) return;

    try {
      await deleteDoc(doc(db, 'projects', currentProject.id, 'members', memberId));
      setMembers(members.filter(m => m.id !== memberId));
    } catch (err) {
      console.error('Error deleting member:', err);
      setError('Failed to delete member');
    }
  };

  // Filter members based on search term
  const filteredMembers = members.filter(member => 
    member.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!currentProject) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Project Selected</h2>
          <p className="text-gray-600">Please select a project to manage team members.</p>
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

      <TeamMembersToolbar
        onSearch={setSearchTerm}
        onAddMember={handleAddMember}
      />

      <TeamMembersTable
        members={filteredMembers}
        onEdit={handleUpdateMember}
        onDelete={handleDeleteMember}
      />
    </div>
  );
}