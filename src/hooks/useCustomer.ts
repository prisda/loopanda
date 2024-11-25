import { useState, useEffect } from 'react';
import { Customer } from '../types/customer';
import { mockApi } from '../services/mockApi';

export function useCustomer(customerId?: string) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!customerId) {
      setLoading(false);
      return;
    }

    const fetchCustomer = async () => {
      try {
        const data = await mockApi.getCustomerById(customerId);
        setCustomer(data);
      } catch (err) {
        setError('Failed to fetch customer data');
        console.error('Error fetching customer:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [customerId]);

  return { customer, loading, error };
}