import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TutorialState {
  seenTutorial: boolean;
  markTutorialSeen: () => void;
}

export const useTutorialStore = create<TutorialState>()(
  persist(
    (set) => ({
      seenTutorial: false,
      markTutorialSeen: () => set({ seenTutorial: true }),
    }),
    { name: 'quest-forge-tutorial' }
  )
);