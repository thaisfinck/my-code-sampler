import { create } from 'zustand';
import type { Category, VizStore } from '../types/dataVizTypes';
import { generateDataset } from '../data';

const DEFAULT_CATEGORIES: Set<Category> = new Set<Category>(['A', 'B', 'C']);

export const useStateDrivenVizStore = create<VizStore>((set, get) => ({
  data: generateDataset(650, 1),
  filters: {
    valueRange: [0, 100],
    categories: new Set(DEFAULT_CATEGORIES),
  },
  viewMode: 'scatter',
  density: {
    cellSizePx: 18,
  },

  setViewMode: (mode) => set({ viewMode: mode }),

  setValueRange: (range) =>
    set((state) => ({
      filters: {
        ...state.filters,
        valueRange: range,
      },
    })),

  toggleCategory: (category) =>
    set((state) => {
      const next = new Set(state.filters.categories);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return {
        filters: {
          ...state.filters,
          categories: next,
        },
      };
    }),

  regenerateData: (count = 650) =>
    set(() => {
      const current = get().data;
      // quick seed bump based on previous length to keep it deterministic-ish without storing seed
      const seed = Math.max(1, current.length % 97) + 1;
      return { data: generateDataset(count, seed) };
    }),

  setDensityCellSizePx: (cellSizePx) =>
    set((state) => ({
      density: {
        ...state.density,
        cellSizePx,
      },
    })),
}));
