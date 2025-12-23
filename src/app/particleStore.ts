/* eslint-disable no-unused-vars */
import { create } from 'zustand';

export const useParticleStore = create<{
  enabled: boolean;
  particleCount: number;
  interactionEnabled: boolean;
  setEnabled: (enabled: boolean) => void;
  setParticleCount: (count: number) => void;
  setInteractionEnabled: (enabled: boolean) => void;
}>((set) => ({
  enabled: true,
  particleCount: 100,
  interactionEnabled: true,
  setEnabled: (enabled) => set({ enabled }),
  setParticleCount: (count) => set({ particleCount: count }),
  setInteractionEnabled: (enabled) => set({ interactionEnabled: enabled }),
}));
