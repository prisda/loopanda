import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useProject } from '../contexts/ProjectContext';
import { Send, Plus, Clock, Mail, X } from 'lucide-react';
import { collection, query, getDocs, addDoc, deleteDoc, doc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { generatePassword } from '../utils/password';
import { BulkInviteInput } from '../components/BulkInviteInput';
import { sendInvitationEmail, sendWelcomeEmail } from '../utils/email';

interface DirectAddUser {
  username: string;
  email: string;
  password: string;
  role: string;
}

export function AdminInvitesPage() {
  const { user } = useAuth();
  const { currentProject } = useProject();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [showDirectAdd, setShowDirectAdd] = useState(false);
  const [directAdd, setDirectAdd] = useState<DirectAddUser>({
    username: '',
    email: '',
    password: generatePassword(),
    role: 'member'
  });
  const [bulkEmails, setBulkEmails] = useState<string[]>([]);

  useEffect(() => {
    if (!currentProject?.id) {
      setLoading(false);
      return;
    }

    const fetchInvitations = async () => {
      try {
        setLoading(false);
      } catch (error) {
        console.error('Error fetching invitations:', error);
        setError('Failed to fetch invitations');
      } finally {
        setLoading(false);
      }
    };

    fetchInvitations();
  }, [currentProject?.id]);

  const handleDirectAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProject || isSubmitting) return;

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      // Create user document with generated credentials
      const userRef = doc(collection(db, 'users'));
      const userData = {
        uid: userRef.id,
        email: directAdd.email,
        displayName: directAdd.username,
        photoURL: null,
        isAdmin: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastLogin: null,
        projects: {
          [currentProject.id]: {
            role: directAdd.role,
            joinedAt: serverTimestamp()
          }
        }
      };

      // Add user to users collection
      await setDoc(userRef, userData);

      // Update project members
      const projectRef = doc(db, 'projects', currentProject.id);
      await updateDoc(projectRef, {
        [`members.${userRef.id}`]: {
          role: directAdd.role,
          joinedAt: serverTimestamp(),
          status: 'active'
        },
        updatedAt: serverTimestamp()
      });

      // Send welcome email with credentials
      await sendWelcomeEmail({
        to: directAdd.email,
        projectName: currentProject.name,
        password: directAdd.password,
        loginLink: `${window.location.origin}/login`
      });

      setSuccess(`Successfully added ${directAdd.username} to the project`);
      setDirectAdd({
        username: '',
        email: '',
        password: generatePassword(),
        role: 'member'
      });
      setShowDirectAdd(false);
    } catch (error) {
      console.error('Error adding user:', error);
      setError('Failed to add user. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentProject) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Project Selected</h2>
          <p className="text-gray-600">Please select a project to manage invitations.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {currentProject.name}
          <span className="text-gray-500 font-normal ml-2">/ Team Management</span>
        </h1>
      </div>

      {error && (
        <div className="alert alert-error mb-6">
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="alert alert-success mb-6">
          <span>{success}</span>
        </div>
      )}

      {/* Direct Add Form */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Add Team Members</h2>
          <div className="flex gap-3">
            <button
              onClick={() => setShowDirectAdd(!showDirectAdd)}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              {showDirectAdd ? 'Send Invitations' : 'Add Member Directly'}
            </button>
          </div>
        </div>

        {showDirectAdd ? (
          <form onSubmit={handleDirectAdd} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={directAdd.username}
                  onChange={e => setDirectAdd(prev => ({ ...prev, username: e.target.value }))}
                  required
                  className="input input-bordered w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={directAdd.email}
                  onChange={e => setDirectAdd(prev => ({ ...prev, email: e.target.value }))}
                  required
                  className="input input-bordered w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={directAdd.password}
                    onChange={e => setDirectAdd(prev => ({ ...prev, password: e.target.value }))}
                    required
                    className="input input-bordered flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => setDirectAdd(prev => ({ ...prev, password: generatePassword() }))}
                    className="btn btn-outline"
                  >
                    Generate
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={directAdd.role}
                  onChange={e => setDirectAdd(prev => ({ ...prev, role: e.target.value }))}
                  className="select select-bordered w-full"
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary"
              >
                {isSubmitting ? 'Adding Member...' : 'Add Member'}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <BulkInviteInput
              value={bulkEmails}
              onChange={setBulkEmails}
              placeholder="Enter email addresses (comma-separated)"
            />

            <div className="flex justify-end">
              <button
                onClick={() => {/* Handle bulk invite */}}
                disabled={isSubmitting || bulkEmails.length === 0}
                className="btn btn-primary"
              >
                <Mail className="w-4 h-4 mr-2" />
                Send {bulkEmails.length} Invitation{bulkEmails.length !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}