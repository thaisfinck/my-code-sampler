/* eslint-disable no-unused-vars */
export type Category = 'A' | 'B' | 'C';

export type DataPoint = {
  id: string;
  x: number;
  y: number;
  value: number;
  category: Category;
};

export type ViewMode = 'scatter' | 'density';

export type Filters = {
  valueRange: [number, number];
  categories: Set<Category>;
};

export type DensitySettings = {
  cellSizePx: number;
};

export type VizState = {
  data: DataPoint[];
  filters: Filters;
  viewMode: ViewMode;
  density: DensitySettings;
};

export type VizActions = {
  setViewMode: (mode: ViewMode) => void;
  setValueRange: (range: [number, number]) => void;
  toggleCategory: (category: Category) => void;
  regenerateData: (count?: number) => void;
  setDensityCellSizePx: (cellSizePx: number) => void;
};

export type VizStore = VizState & VizActions;
