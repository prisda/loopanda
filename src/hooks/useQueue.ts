import { useState, useEffect } from 'react';
import { QueueItem } from '../types/customer';
import { mockApi } from '../services/mockApi';

export function useQueue(customerId?: string) {
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQueueItems = async () => {
      try {
        const data = customerId
          ? await mockApi.getQueueItemsByCustomer(customerId)
          : await mockApi.getQueueItems();
        setQueueItems(data);
      } catch (err) {
        setError('Failed to fetch queue data');
        console.error('Error fetching queue items:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchQueueItems();
  }, [customerId]);

  return { queueItems, loading, error };
}