import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LayoutState {
  filterLayout: 'horizontal' | 'vertical';
  displayDensity: 'loose' | 'normal' | 'compact';
  setFilterLayout: (layout: 'horizontal' | 'vertical') => void;
  setDisplayDensity: (density: 'loose' | 'normal' | 'compact') => void;
}

export const useLayoutStore = create<LayoutState>()(
  persist(
    (set) => ({
      filterLayout: 'horizontal',
      displayDensity: 'normal',
      setFilterLayout: (layout) => set({ filterLayout: layout }),
      setDisplayDensity: (density) => set({ displayDensity: density }),
    }),
    {
      name: 'feature-layout-preferences',
    }
  )
);