import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TeamMember, TeamMemberFilters, TeamMemberSort, TeamRole } from '../types/team';

interface TeamState {
  members: TeamMember[];
  filters: TeamMemberFilters;
  sort: TeamMemberSort;
  selectedIds: string[];
  loading: boolean;
  error: string | null;
  setMembers: (members: TeamMember[]) => void;
  addMember: (member: TeamMember) => void;
  updateMember: (id: string, updates: Partial<TeamMember>) => void;
  deleteMember: (id: string) => void;
  setFilters: (filters: TeamMemberFilters) => void;
  setSort: (sort: TeamMemberSort) => void;
  setSelectedIds: (ids: string[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  bulkUpdateRole: (ids: string[], role: TeamRole) => void;
  bulkUpdateStatus: (ids: string[], status: 'active' | 'inactive') => void;
  bulkDelete: (ids: string[]) => void;
}

export const useTeamStore = create<TeamState>()(
  persist(
    (set) => ({
      members: [],
      filters: {},
      sort: { field: 'displayName', direction: 'asc' },
      selectedIds: [],
      loading: false,
      error: null,

      setMembers: (members) => set({ members }),
      
      addMember: (member) => set((state) => ({
        members: [...state.members, member]
      })),
      
      updateMember: (id, updates) => set((state) => ({
        members: state.members.map((member) =>
          member.id === id ? { ...member, ...updates } : member
        )
      })),
      
      deleteMember: (id) => set((state) => ({
        members: state.members.filter((member) => member.id !== id),
        selectedIds: state.selectedIds.filter((selectedId) => selectedId !== id)
      })),
      
      setFilters: (filters) => set({ filters }),
      setSort: (sort) => set({ sort }),
      setSelectedIds: (selectedIds) => set({ selectedIds }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      
      bulkUpdateRole: (ids, role) => set((state) => ({
        members: state.members.map((member) =>
          ids.includes(member.id) ? { ...member, role } : member
        )
      })),
      
      bulkUpdateStatus: (ids, status) => set((state) => ({
        members: state.members.map((member) =>
          ids.includes(member.id) ? { ...member, status } : member
        )
      })),
      
      bulkDelete: (ids) => set((state) => ({
        members: state.members.filter((member) => !ids.includes(member.id)),
        selectedIds: state.selectedIds.filter((id) => !ids.includes(id))
      }))
    }),
    {
      name: 'team-store'
    }
  )
);