import { QueueItem } from '../types/customer';

export const mockQueue: QueueItem[] = [
  {
    id: 'q_001',
    customerId: 'cust_001',
    type: 'support',
    priority: 'medium',
    status: 'waiting',
    timestamp: '2024-03-12T10:30:00Z',
    estimatedWaitTime: 15,
    metadata: {
      issue: 'Configuration Help',
      platform: 'Web'
    }
  },
  {
    id: 'q_002',
    customerId: 'cust_003',
    type: 'technical',
    priority: 'high',
    status: 'in-progress',
    timestamp: '2024-03-12T10:15:00Z',
    estimatedWaitTime: 5,
    metadata: {
      issue: 'API Integration',
      severity: 'Critical'
    }
  },
  {
    id: 'q_003',
    customerId: 'cust_002',
    type: 'sales',
    priority: 'low',
    status: 'waiting',
    timestamp: '2024-03-12T10:45:00Z',
    estimatedWaitTime: 30,
    metadata: {
      topic: 'Upgrade Discussion',
      currentPlan: 'smart+'
    }
  },
  {
    id: 'q_004',
    customerId: 'cust_005',
    type: 'technical',
    priority: 'high',
    status: 'waiting',
    timestamp: '2024-03-12T10:20:00Z',
    estimatedWaitTime: 10,
    metadata: {
      issue: 'Performance Optimization',
      environment: 'Production'
    }
  },
  {
    id: 'q_005',
    customerId: 'cust_004',
    type: 'support',
    priority: 'low',
    status: 'completed',
    timestamp: '2024-03-12T09:30:00Z',
    estimatedWaitTime: 0,
    metadata: {
      issue: 'Account Access',
      resolution: 'Password Reset'
    }
  }
];