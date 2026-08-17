import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { applyThemeMode, type ThemeMode } from '../theme/theme';


export type LeftTab = 'navigator' | 'plugins' | 'compendiums';
export type RightTab = 'inspector' | 'journalToc';
export type BottomTab = 'chat' | 'logs' | 'dslTerminal' | 'initiative' | 'multiplayer';

interface UiState {
  themeMode: ThemeMode;

  leftVisible: boolean;
  rightVisible: boolean;
  bottomVisible: boolean;

  activeLeftTab: LeftTab;
  activeRightTab: RightTab;
  activeBottomTab: BottomTab;

  pluginThemeId: string | null;
  setPluginThemeId: (id: string | null) => void;

  setThemeMode: (mode: ThemeMode) => void;

  toggleLeft: () => void;
  toggleRight: () => void;
  toggleBottom: () => void;

  setActiveLeftTab: (tab: LeftTab) => void;
  setActiveRightTab: (tab: RightTab) => void;
  setActiveBottomTab: (tab: BottomTab) => void;

  toggleLeftTab: (tab: LeftTab) => void;
  toggleRightTab: (tab: RightTab) => void;

  setLeftVisible: (visible: boolean) => void;
  setRightVisible: (visible: boolean) => void;
  setBottomVisible: (visible: boolean) => void;

  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
  setConnectionStatus: (status: 'disconnected' | 'connecting' | 'connected' | 'error') => void;

  userRole: 'gm' | 'co_gm' | 'player' | 'spectator' | null;
  setUserRole: (role: 'gm' | 'co_gm' | 'player' | 'spectator' | null) => void;
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

      setThemeMode: (mode) => {
        set({ themeMode: mode });

        applyThemeMode(mode);
      },

      toggleLeft: () =>
        set((state) => ({ leftVisible: !state.leftVisible })),

      toggleRight: () =>
        set((state) => ({ rightVisible: !state.rightVisible })),

      toggleBottom: () =>
        set((state) => ({ bottomVisible: !state.bottomVisible })),

      setActiveLeftTab: (activeLeftTab) => set({ activeLeftTab }),
      setActiveRightTab: (activeRightTab) => set({ activeRightTab }),
      setActiveBottomTab: (activeBottomTab) => set({ activeBottomTab }),

      setLeftVisible: (leftVisible) => set({ leftVisible }),
      setRightVisible: (rightVisible) => set({ rightVisible }),
      setBottomVisible: (bottomVisible) => set({ bottomVisible }),
      toggleLeftTab: (tab) =>
        set((state) => {
          // Если левая панель скрыта — открываем её и выбираем таб.
          if (!state.leftVisible) {
            return {
              leftVisible: true,
              activeLeftTab: tab,
            };
          }

          // Если панель открыта и клик по тому же табу — скрываем панель.
          if (state.activeLeftTab === tab) {
            return {
              leftVisible: false,
            };
          }

          // Если панель открыта и клик по другому табу — переключаем таб.
          return {
            activeLeftTab: tab,
          };
        }),

      toggleRightTab: (tab) =>
        set((state) => {
          // Если правая панель скрыта — открываем её и выбираем таб.
          if (!state.rightVisible) {
            return {
              rightVisible: true,
              activeRightTab: tab,
            };
          }

          // Если панель открыта и клик по тому же табу — скрываем панель.
          if (state.activeRightTab === tab) {
            return {
              rightVisible: false,
            };
          }

          // Если панель открыта и клик по другому табу — переключаем таб.
          return {
            activeRightTab: tab,
          };
        }),

      pluginThemeId: null,

      setPluginThemeId: (pluginThemeId) => set({ pluginThemeId }),

      connectionStatus: 'disconnected',
      setConnectionStatus: (connectionStatus) => set({ connectionStatus }),

      userRole: null,
      setUserRole: (userRole) => set({ userRole }),

    }),
    {
      name: 'dndstudio.ui',
    },
  ),
);