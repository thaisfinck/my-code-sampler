import { create } from 'zustand';
import type { Stitches, StitchesVizState } from '../types/stitchesVizTypes';

const DEFAULT_STITCHES: Set<Stitches> = new Set<Stitches>([
  'Cross',
  'Back',
  'French',
]);

const generateStitchesDataset = (count: number, seed: number) => {
  const stitchesArray: Stitches[] = ['Cross', 'Back', 'French'];
  const data: Array<{
    id: string;
    x: number;
    y: number;
    value: number;
    stitch: Stitches;
  }> = [];

  const stitchesPerType = Math.ceil(count / 3);
  const yPositions = [25, 50, 75]; // Three horizontal lines: top, middle, bottom

  stitchesArray.forEach((stitchType, typeIndex) => {
    const startIndex = typeIndex * stitchesPerType;
    const endIndex = Math.min(startIndex + stitchesPerType, count);
    const stitchesInThisLine = endIndex - startIndex;

    for (let i = 0; i < stitchesInThisLine; i += 1) {
      const globalIndex = startIndex + i;
      const randomValue = Math.abs(Math.sin(seed + globalIndex)) * 100;
      // evenly distributed from 10% to 90% of canvas width within this line
      const x =
        stitchesInThisLine > 1 ? 10 + (i / (stitchesInThisLine - 1)) * 80 : 50;
      const y = yPositions[typeIndex]; // Each type gets its own horizontal line

      data.push({
        id: `stitch-${stitchType}-${i + 1}`,
        x,
        y,
        value: randomValue,
        stitch: stitchType,
      });
    }
  });

  return data;
};

export const useStitchesVizStore = create<StitchesVizState>((set) => ({
  data: generateStitchesDataset(60, 1),
  filters: {
    amountOfStitches: 40,
    stitches: DEFAULT_STITCHES,
  },

  setAmountOfStitches: (amount: number) =>
    set((state) => ({
      filters: {
        ...state.filters,
        amountOfStitches: amount,
      },
    })),

  toggleStitch: (stitch: Stitches) =>
    set((state) => {
      const next = new Set(state.filters.stitches);
      if (next.has(stitch)) next.delete(stitch);
      else next.add(stitch);
      return {
        filters: {
          ...state.filters,
          stitches: next,
        },
      };
    }),

  regenerateData: (count: number) =>
    set(() => {
      const seed = Math.max(1, count % 97) + 1;
      return { data: generateStitchesDataset(count, seed) };
    }),
}));
