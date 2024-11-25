export type TeamRole = 'owner' | 'admin' | 'member' | 'viewer';

export interface TeamMember {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: TeamRole;
  status: 'active' | 'inactive';
  joinedAt: Date;
  lastActive?: Date;
  permissions: string[];
}

export interface TeamMemberFormData {
  email: string;
  displayName: string;
  role: TeamRole;
  permissions: string[];
}

export interface TeamMemberFilters {
  role?: TeamRole;
  status?: 'active' | 'inactive';
  search?: string;
}

export interface TeamMemberSort {
  field: keyof TeamMember;
  direction: 'asc' | 'desc';
}

export interface BulkAction {
  type: 'activate' | 'deactivate' | 'delete' | 'changeRole';
  role?: TeamRole;
  memberIds: string[];
}