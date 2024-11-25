import { Customer, QueueItem } from '../types/customer';
import { mockCustomers } from '../mocks/customerData';
import { mockQueue } from '../mocks/queueData';

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockApi = {
  // Customer APIs
  async getCustomers(): Promise<Customer[]> {
    await delay(800);
    return mockCustomers;
  },

  async getCustomerById(id: string): Promise<Customer | null> {
    await delay(500);
    return mockCustomers.find(customer => customer.id === id) || null;
  },

  async getCustomersBySubscription(tier: string): Promise<Customer[]> {
    await delay(800);
    return mockCustomers.filter(customer => customer.subscription.tier === tier);
  },

  // Queue APIs
  async getQueueItems(): Promise<QueueItem[]> {
    await delay(600);
    return mockQueue;
  },

  async getQueueItemsByCustomer(customerId: string): Promise<QueueItem[]> {
    await delay(500);
    return mockQueue.filter(item => item.customerId === customerId);
  },

  async getQueueItemsByStatus(status: string): Promise<QueueItem[]> {
    await delay(600);
    return mockQueue.filter(item => item.status === status);
  },

  async getQueueItemsByType(type: string): Promise<QueueItem[]> {
    await delay(600);
    return mockQueue.filter(item => item.type === type);
  },

  // Analytics APIs
  async getCustomerMetrics(): Promise<{
    totalCustomers: number;
    activeSubscriptions: number;
    subscriptionsByTier: Record<string, number>;
  }> {
    await delay(1000);
    const metrics = {
      totalCustomers: mockCustomers.length,
      activeSubscriptions: mockCustomers.filter(c => c.subscription.isActive).length,
      subscriptionsByTier: mockCustomers.reduce((acc, customer) => {
        const tier = customer.subscription.tier;
        acc[tier] = (acc[tier] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
    return metrics;
  },

  async getQueueMetrics(): Promise<{
    totalItems: number;
    itemsByStatus: Record<string, number>;
    itemsByType: Record<string, number>;
    averageWaitTime: number;
  }> {
    await delay(1000);
    const metrics = {
      totalItems: mockQueue.length,
      itemsByStatus: mockQueue.reduce((acc, item) => {
        acc[item.status] = (acc[item.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      itemsByType: mockQueue.reduce((acc, item) => {
        acc[item.type] = (acc[item.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      averageWaitTime: mockQueue.reduce((acc, item) => acc + item.estimatedWaitTime, 0) / mockQueue.length
    };
    return metrics;
  }
};