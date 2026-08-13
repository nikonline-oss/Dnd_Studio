import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeMode = 'system' | 'light' | 'dark';

export type LeftTab = 'navigator' | 'plugins' | 'compendiums';
export type RightTab = 'inspector' | 'journalToc';
export type BottomTab = 'chat' | 'logs' | 'dslTerminal';

interface UiState {
  themeMode: ThemeMode;

  leftVisible: boolean;
  rightVisible: boolean;
  bottomVisible: boolean;

  activeLeftTab: LeftTab;
  activeRightTab: RightTab;
  activeBottomTab: BottomTab;

  setThemeMode: (mode: ThemeMode) => void;

  toggleLeft: () => void;
  toggleRight: () => void;
  toggleBottom: () => void;

  setActiveLeftTab: (tab: LeftTab) => void;
  setActiveRightTab: (tab: RightTab) => void;
  setActiveBottomTab: (tab: BottomTab) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      themeMode: 'system',

      leftVisible: true,
      rightVisible: true,
      bottomVisible: true,

      activeLeftTab: 'navigator',
      activeRightTab: 'inspector',
      activeBottomTab: 'chat',

      setThemeMode: (themeMode) => set({ themeMode }),

      toggleLeft: () =>
        set((state) => ({ leftVisible: !state.leftVisible })),

      toggleRight: () =>
        set((state) => ({ rightVisible: !state.rightVisible })),

      toggleBottom: () =>
        set((state) => ({ bottomVisible: !state.bottomVisible })),

      setActiveLeftTab: (activeLeftTab) => set({ activeLeftTab }),
      setActiveRightTab: (activeRightTab) => set({ activeRightTab }),
      setActiveBottomTab: (activeBottomTab) => set({ activeBottomTab }),
    }),
    {
      name: 'dndstudio.ui',
    },
  ),
);