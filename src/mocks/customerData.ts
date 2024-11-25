import { Customer, SubscriptionTier } from '../types/customer';

const SUBSCRIPTION_FEATURES: Record<SubscriptionTier, string[]> = {
  'starter+': [
    'Basic Support',
    'Core Features',
    'Community Access',
    '5 Team Members'
  ],
  'smart+': [
    'Priority Support',
    'Advanced Features',
    'API Access',
    '15 Team Members',
    'Custom Integrations'
  ],
  'pro': [
    '24/7 Support',
    'Enterprise Features',
    'Unlimited API Access',
    'Unlimited Team Members',
    'Custom Development',
    'Dedicated Account Manager'
  ]
};

export const mockCustomers: Customer[] = [
  {
    id: 'cust_001',
    name: 'John Smith',
    email: 'john.smith@techcorp.com',
    company: 'TechCorp Solutions',
    subscription: {
      tier: 'starter+',
      expiryDate: '2024-12-31',
      isActive: true,
      features: SUBSCRIPTION_FEATURES['starter+']
    },
    metadata: {
      createdAt: '2023-01-15',
      lastLogin: '2024-03-10',
      region: 'NA'
    }
  },
  {
    id: 'cust_002',
    name: 'Sarah Johnson',
    email: 'sarah.j@innovate.io',
    company: 'Innovate Labs',
    subscription: {
      tier: 'smart+',
      expiryDate: '2024-09-15',
      isActive: true,
      features: SUBSCRIPTION_FEATURES['smart+']
    },
    metadata: {
      createdAt: '2023-05-20',
      lastLogin: '2024-03-11',
      region: 'EU'
    }
  },
  {
    id: 'cust_003',
    name: 'Michael Chen',
    email: 'm.chen@enterprise.com',
    company: 'Enterprise Global',
    subscription: {
      tier: 'pro',
      expiryDate: '2025-06-30',
      isActive: true,
      features: SUBSCRIPTION_FEATURES['pro']
    },
    metadata: {
      createdAt: '2023-08-10',
      lastLogin: '2024-03-12',
      region: 'APAC'
    }
  },
  {
    id: 'cust_004',
    name: 'Emma Wilson',
    email: 'emma@startupfast.co',
    company: 'StartupFast',
    subscription: {
      tier: 'starter+',
      expiryDate: '2024-08-20',
      isActive: true,
      features: SUBSCRIPTION_FEATURES['starter+']
    },
    metadata: {
      createdAt: '2024-01-05',
      lastLogin: '2024-03-10',
      region: 'NA'
    }
  },
  {
    id: 'cust_005',
    name: 'Luis Rodriguez',
    email: 'luis@megacorp.com',
    company: 'MegaCorp Industries',
    subscription: {
      tier: 'pro',
      expiryDate: '2025-03-15',
      isActive: true,
      features: SUBSCRIPTION_FEATURES['pro']
    },
    metadata: {
      createdAt: '2023-11-30',
      lastLogin: '2024-03-11',
      region: 'LATAM'
    }
  }
];