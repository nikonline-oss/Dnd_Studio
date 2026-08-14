import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface MapSettingsState {
  showGridByMap: Record<string, boolean>;

  setShowGrid: (mapId: string, visible: boolean) => void;
  toggleGrid: (mapId: string) => void;
}

export const useMapSettingsStore = create<MapSettingsState>()(
  persist(
    (set) => ({
      showGridByMap: {},

      setShowGrid: (mapId, visible) =>
        set((state) => ({
          showGridByMap: {
            ...state.showGridByMap,
            [mapId]: visible,
          },
        })),

      toggleGrid: (mapId) =>
        set((state) => {
          const current = state.showGridByMap[mapId] ?? true;

          return {
            showGridByMap: {
              ...state.showGridByMap,
              [mapId]: !current,
            },
          };
        }),
    }),
    {
      name: 'dndstudio.map-settings',
      partialize: (state) => ({
        showGridByMap: state.showGridByMap,
      }),
    },
  ),
);