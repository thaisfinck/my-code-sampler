import type { Category, DataPoint, DatasetParams } from '../types/dataVizTypes';
import { generateDataset } from '../data';

export type UpdateDataPointInput = {
  id: string;
  value?: number;
  category?: Category;
};

let db: DataPoint[] | null = null;
let currentSeed = 1;

const DEFAULT_COUNT = 200;

const wait = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

const withLatency = async <T>(fn: () => T): Promise<T> => {
  // Simulate 250–800ms of network latency
  const ms = 250 + Math.random() * 550;
  await wait(ms);
  return fn();
};

const initDb = (params?: DatasetParams) => {
  const count = params?.count ?? DEFAULT_COUNT;
  const seed = params?.seed ?? currentSeed;
  currentSeed = seed;
  db = generateDataset(count, seed);
};

export const fetchDataset = async (
  params?: DatasetParams
): Promise<DataPoint[]> =>
  withLatency(() => {
    if (!db) {
      initDb(params);
    }
    return [...(db as DataPoint[])];
  });

export const regenerateDataset = async (
  params?: DatasetParams
): Promise<DataPoint[]> =>
  withLatency(() => {
    const nextSeed = params?.seed ?? ((db?.length ?? DEFAULT_COUNT) % 97) + 1;

    initDb({
      count: params?.count ?? db?.length ?? DEFAULT_COUNT,
      seed: nextSeed,
    });

    return [...(db as DataPoint[])];
  });

export const updateDataPoint = async (
  input: UpdateDataPointInput
): Promise<DataPoint> =>
  withLatency(() => {
    if (!db) {
      initDb();
    }

    const records = db as DataPoint[];
    const index = records.findIndex((p) => p.id === input.id);
    if (index === -1) {
      throw new Error(`Data point with id "${input.id}" not found`);
    }

    const current = records[index]!;
    const updated: DataPoint = {
      ...current,
      ...(input.value !== undefined ? { value: input.value } : null),
      ...(input.category !== undefined ? { category: input.category } : null),
    };

    records[index] = updated;
    return updated;
  });
