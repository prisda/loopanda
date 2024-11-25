import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { TeamMember, TeamRole } from '../../types/team';
import { X } from 'lucide-react';

interface EditMemberModalProps {
  member: TeamMember;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (member: TeamMember) => void;
}

export function EditMemberModal({ member, isOpen, onClose, onSubmit }: EditMemberModalProps) {
  const [formData, setFormData] = useState({
    displayName: member.displayName,
    role: member.role,
    status: member.status,
    permissions: member.permissions
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.displayName) {
      newErrors.displayName = 'Name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({
        ...member,
        ...formData
      });
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-lg font-semibold text-gray-900">
              Edit Team Member
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={member.email}
                disabled
                className="w-full rounded-lg border-gray-300 bg-gray-50 text-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                className="w-full rounded-lg border-gray-300 focus:ring-brand focus:border-brand"
              />
              {errors.displayName && (
                <p className="mt-1 text-sm text-red-600">{errors.displayName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as TeamRole })}
                className="w-full rounded-lg border-gray-300 focus:ring-brand focus:border-brand"
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                className="w-full rounded-lg border-gray-300 focus:ring-brand focus:border-brand"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Permissions
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.permissions.includes('view_features')}
                    onChange={(e) => {
                      const newPermissions = e.target.checked
                        ? [...formData.permissions, 'view_features']
                        : formData.permissions.filter(p => p !== 'view_features');
                      setFormData({ ...formData, permissions: newPermissions });
                    }}
                    className="rounded border-gray-300 text-brand focus:ring-brand"
                  />
                  <span className="ml-2 text-sm text-gray-600">View Features</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.permissions.includes('create_comments')}
                    onChange={(e) => {
                      const newPermissions = e.target.checked
                        ? [...formData.permissions, 'create_comments']
                        : formData.permissions.filter(p => p !== 'create_comments');
                      setFormData({ ...formData, permissions: newPermissions });
                    }}
                    className="rounded border-gray-300 text-brand focus:ring-brand"
                  />
                  <span className="ml-2 text-sm text-gray-600">Create Comments</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand/90 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}