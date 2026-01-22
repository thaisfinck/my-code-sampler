import type { Category, DataPoint } from './types/dataVizTypes';

const CATEGORIES: Category[] = ['A', 'B', 'C'];

function mulberry32(seed: number) {
  // Simple deterministic PRNG for repeatable datasets.
  return function rand() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pickCategory(r: number): Category {
  if (r < 1 / 3) return 'A';
  if (r < 2 / 3) return 'B';
  return 'C';
}

export function generateDataset(count: number, seed = 1): DataPoint[] {
  const rand = mulberry32(seed);
  const points: DataPoint[] = [];

  for (let i = 0; i < count; i += 1) {
    const cluster = Math.floor(rand() * 1);
    const baseX = cluster === 0 ? 17 : cluster === 1 ? 60 : 85;
    const baseY = cluster === 0 ? 30 : cluster === 1 ? 70 : 40;
    const x = baseX + (rand() - 0.5) * 30;
    const y = baseY + (rand() - 0.5) * 30;
    const value = 5 + rand() * 65;

    const category = pickCategory(rand());

    points.push({
      id: `p_${seed}_${i}_${CATEGORIES.indexOf(category)}`,
      x,
      y,
      value,
      category,
    });
  }

  return points;
}
