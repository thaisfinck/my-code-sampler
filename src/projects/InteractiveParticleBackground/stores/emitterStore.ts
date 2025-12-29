/* eslint-disable no-unused-vars */
import { create } from 'zustand';

export const useEmitterStore = create<{
  enabled: boolean;
  interactionEnabled: boolean;
  setEnabled: (enabled: boolean) => void;
  setInteractionEnabled: (enabled: boolean) => void;
}>((set) => ({
  enabled: false,
  interactionEnabled: true,
  setEnabled: (enabled) => set({ enabled }),
  setInteractionEnabled: (enabled) => set({ interactionEnabled: enabled }),
}));
