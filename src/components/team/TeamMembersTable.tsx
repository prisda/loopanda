import { useState } from 'react';
import { useTeamStore } from '../../store/teamStore';
import { TeamMember, TeamRole } from '../../types/team';
import { UserThumbnail } from '../UserThumbnail';
import { ChevronUp, ChevronDown, MoreHorizontal, Trash2, Edit2 } from 'lucide-react';
import { Menu } from '@headlessui/react';
import { clsx } from 'clsx';
import { formatDate } from '../../utils/date';
import { ConfirmDialog } from '../ConfirmDialog';
import { EditMemberModal } from './EditMemberModal';

interface TeamMembersTableProps {
  onEdit: (member: TeamMember) => void;
  onDelete: (memberId: string) => void;
}

export function TeamMembersTable({ onEdit, onDelete }: TeamMembersTableProps) {
  const { members, sort, setSort, selectedIds, setSelectedIds } = useTeamStore();
  const [memberToDelete, setMemberToDelete] = useState<TeamMember | null>(null);
  const [memberToEdit, setMemberToEdit] = useState<TeamMember | null>(null);

  const handleSort = (field: keyof TeamMember) => {
    setSort({
      field,
      direction: sort.field === field && sort.direction === 'asc' ? 'desc' : 'asc'
    });
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedIds(e.target.checked ? members.map(m => m.id) : []);
  };

  const handleSelectMember = (e: React.ChangeEvent<HTMLInputElement>, memberId: string) => {
    setSelectedIds(
      e.target.checked
        ? [...selectedIds, memberId]
        : selectedIds.filter(id => id !== memberId)
    );
  };

  const handleDeleteConfirm = () => {
    if (memberToDelete) {
      onDelete(memberToDelete.id);
      setMemberToDelete(null);
    }
  };

  const handleEditSubmit = (member: TeamMember) => {
    onEdit(member);
    setMemberToEdit(null);
  };

  const sortedMembers = [...members].sort((a, b) => {
    const direction = sort.direction === 'asc' ? 1 : -1;
    if (a[sort.field] < b[sort.field]) return -1 * direction;
    if (a[sort.field] > b[sort.field]) return 1 * direction;
    return 0;
  });

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === members.length}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-brand focus:ring-brand"
                  />
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('displayName')}
                >
                  <div className="flex items-center gap-2">
                    Member
                    {sort.field === 'displayName' && (
                      sort.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('role')}
                >
                  <div className="flex items-center gap-2">
                    Role
                    {sort.field === 'role' && (
                      sort.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center gap-2">
                    Status
                    {sort.field === 'status' && (
                      sort.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('joinedAt')}
                >
                  <div className="flex items-center gap-2">
                    Joined
                    {sort.field === 'joinedAt' && (
                      sort.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedMembers.map(member => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(member.id)}
                      onChange={(e) => handleSelectMember(e, member.id)}
                      className="rounded border-gray-300 text-brand focus:ring-brand"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <UserThumbnail user={member} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={clsx(
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize',
                      {
                        'bg-purple-100 text-purple-800': member.role === 'owner',
                        'bg-blue-100 text-blue-800': member.role === 'admin',
                        'bg-green-100 text-green-800': member.role === 'member',
                        'bg-gray-100 text-gray-800': member.role === 'viewer'
                      }
                    )}>
                      {member.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={clsx(
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize',
                      member.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    )}>
                      {member.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(member.joinedAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Menu as="div" className="relative inline-block text-left">
                      <Menu.Button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                        <MoreHorizontal className="w-5 h-5" />
                      </Menu.Button>
                      <Menu.Items className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-10">
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={() => setMemberToEdit(member)}
                              className={clsx(
                                'flex items-center w-full px-4 py-2 text-sm',
                                active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                              )}
                            >
                              <Edit2 className="w-4 h-4 mr-2" />
                              Edit Member
                            </button>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={() => setMemberToDelete(member)}
                              className={clsx(
                                'flex items-center w-full px-4 py-2 text-sm',
                                active ? 'bg-red-50 text-red-700' : 'text-red-600'
                              )}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Member
                            </button>
                          )}
                        </Menu.Item>
                      </Menu.Items>
                    </Menu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        isOpen={!!memberToDelete}
        onClose={() => setMemberToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Team Member"
        message={`Are you sure you want to delete ${memberToDelete?.displayName}? This action cannot be undone.`}
      />

      {memberToEdit && (
        <EditMemberModal
          member={memberToEdit}
          isOpen={true}
          onClose={() => setMemberToEdit(null)}
          onSubmit={handleEditSubmit}
        />
      )}
    </>
  );
}