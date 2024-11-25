import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FilterState {
  sortBy: 'latest' | 'top';
  category: string;
  setSortBy: (sort: 'latest' | 'top') => void;
  setCategory: (category: string) => void;
}

export const useFilterStore = create<FilterState>()(
  persist(
    (set) => ({
      sortBy: 'top',
      category: 'All',
      setSortBy: (sortBy) => set({ sortBy }),
      setCategory: (category) => set({ category }),
    }),
    {
      name: 'feature-filters',
    }
  )
);