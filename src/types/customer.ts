export type SubscriptionTier = 'starter+' | 'smart+' | 'pro';

export interface Customer {
  id: string;
  name: string;
  email: string;
  company: string;
  subscription: {
    tier: SubscriptionTier;
    expiryDate: string;
    isActive: boolean;
    features: string[];
  };
  metadata: {
    createdAt: string;
    lastLogin: string;
    region: string;
  };
}

export interface QueueItem {
  id: string;
  customerId: string;
  type: 'support' | 'sales' | 'technical';
  priority: 'low' | 'medium' | 'high';
  status: 'waiting' | 'in-progress' | 'completed';
  timestamp: string;
  estimatedWaitTime: number; // in minutes
  metadata?: Record<string, any>;
}