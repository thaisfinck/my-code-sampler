/* eslint-disable no-unused-vars */
export type Stitches = 'Cross' | 'Back' | 'French';

export type StitchesVizState = {
  data: StitchesDataPoint[];
  filters: {
    amountOfStitches: number;
    stitches: Set<Stitches>;
  };
  setAmountOfStitches: (amount: number) => void;
  toggleStitch: (stitch: Stitches) => void;
  regenerateData: (count: number) => void;
};

export type StitchesDataPoint = {
  id: string;
  x: number;
  y: number;
  value: number;
  stitch: Stitches;
};
