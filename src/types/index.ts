export interface Comment {
  id: string;
  content: string;
  featureId: string;
  projectId: string;
  createdBy: string;
  userDisplayName: string;
  photoURL?: string;
  createdAt: any;
  updatedAt?: any;
  likes: number;
  likedBy: string[];
  approved: boolean;
  image?: string;
  parentId?: string | null;
}

export interface Feature {
  id: string;
  title: string;
  description: string;
  category: string;
  status: FeatureStatus;
  votes: number;
  votedBy: string[];
  projectId: string;
  createdBy: string;
  createdAt: any;
  updatedAt: any;
  commentCount?: number;
  images?: string[];
}

export type FeatureStatus = 'under-review' | 'planned' | 'in-progress' | 'completed';