import { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ProjectCategory } from '../types';

export function useCategories(projectId: string) {
  const [categories, setCategories] = useState<ProjectCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      if (!projectId) {
        setLoading(false);
        return;
      }

      try {
        const categoriesRef = collection(db, 'projects', projectId, 'categories');
        const q = query(categoriesRef, orderBy('order', 'asc'));
        const snapshot = await getDocs(q);
        
        const categoriesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as ProjectCategory[];

        setCategories(categoriesData);
        setError(null);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [projectId]);

  return { categories, loading, error };
}