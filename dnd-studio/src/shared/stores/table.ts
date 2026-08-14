import { create } from 'zustand';

interface TableState {
  selectedMapId: string | null;
  selectedTokenId: string | null;

  setSelectedMapId: (mapId: string | null) => void;
  setSelectedTokenId: (tokenId: string | null) => void;
}

export const useTableStore = create<TableState>()((set) => ({
  selectedMapId: null,
  selectedTokenId: null,

  setSelectedMapId: (mapId) =>
    set({
      selectedMapId: mapId,
    }),

  setSelectedTokenId: (tokenId) =>
    set({
      selectedTokenId: tokenId,
    }),
}));