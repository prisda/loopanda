import { useState } from 'react';
import { Search, Plus } from 'lucide-react';
import { AddMemberModal } from './AddMemberModal';
import { TeamMember } from '../../types/team';

interface TeamMembersToolbarProps {
  onSearch: (term: string) => void;
  onAddMember: (member: TeamMember) => void;
}

export function TeamMembersToolbar({ onSearch, onAddMember }: TeamMembersToolbarProps) {
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 relative">
          <input
            type="text"
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search members..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand/90 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Member
        </button>
      </div>

      <AddMemberModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={(member) => {
          onAddMember(member);
          setShowAddModal(false);
        }}
      />
    </div>
  );
}