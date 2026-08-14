import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface EncounterEntry {
  id: string;
  tokenId: string;
  label: string;
  initiative: number;
}

export interface EncounterMapState {
  entries: EncounterEntry[];
  activeEntryId: string | null;
  round: number;
  started: boolean;
}

interface EncounterState {
  selectedMapId: string | null;
  encounters: Record<string, EncounterMapState>;

  setSelectedMapId: (mapId: string | null) => void;

  addTokens: (
    mapId: string,
    tokensToAdd: Array<{
      tokenId: string;
      label: string;
      initiative?: number;
    }>,
  ) => void;

  removeEntry: (mapId: string, entryId: string) => void;

  setInitiative: (
    mapId: string,
    entryId: string,
    initiative: number,
  ) => void;

  toggleStarted: (mapId: string) => void;
  nextTurn: (mapId: string) => void;
  resetTurn: (mapId: string) => void;
  clearEncounter: (mapId: string) => void;

  pruneMissingTokens: (mapId: string, validTokenIds: string[]) => void;
}

function createId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return Math.random().toString(36).slice(2);
  }
}

function emptyEncounter(): EncounterMapState {
  return {
    entries: [],
    activeEntryId: null,
    round: 1,
    started: false,
  };
}

function sortEntries(entries: EncounterEntry[]): EncounterEntry[] {
  return [...entries].sort((a, b) => {
    if (b.initiative !== a.initiative) {
      return b.initiative - a.initiative;
    }

    return a.label.localeCompare(b.label);
  });
}

export const useEncounterStore = create<EncounterState>()(
  persist(
    (set) => ({
      selectedMapId: null,
      encounters: {},

      setSelectedMapId: (mapId) =>
        set({
          selectedMapId: mapId,
        }),

      addTokens: (mapId, tokensToAdd) =>
        set((state) => {
          const current =
            state.encounters[mapId] ?? emptyEncounter();

          const existingTokenIds = new Set(
            current.entries.map((entry) => entry.tokenId),
          );

          const newEntries = tokensToAdd
            .filter((token) => !existingTokenIds.has(token.tokenId))
            .map((token) => ({
              id: createId(),
              tokenId: token.tokenId,
              label: token.label,
              initiative: token.initiative ?? 0,
            }));

          if (newEntries.length === 0) {
            return {};
          }

          return {
            encounters: {
              ...state.encounters,
              [mapId]: {
                ...current,
                entries: [...current.entries, ...newEntries],
              },
            },
          };
        }),

      removeEntry: (mapId, entryId) =>
        set((state) => {
          const current =
            state.encounters[mapId] ?? emptyEncounter();

          const entries = current.entries.filter(
            (entry) => entry.id !== entryId,
          );

          let activeEntryId = current.activeEntryId;

          if (activeEntryId === entryId) {
            activeEntryId = sortEntries(entries)[0]?.id ?? null;
          }

          return {
            encounters: {
              ...state.encounters,
              [mapId]: {
                ...current,
                entries,
                activeEntryId,
              },
            },
          };
        }),

      setInitiative: (mapId, entryId, initiative) =>
        set((state) => {
          const current =
            state.encounters[mapId] ?? emptyEncounter();

          const entries = current.entries.map((entry) => {
            if (entry.id !== entryId) {
              return entry;
            }

            return {
              ...entry,
              initiative,
            };
          });

          return {
            encounters: {
              ...state.encounters,
              [mapId]: {
                ...current,
                entries,
              },
            },
          };
        }),

      toggleStarted: (mapId) =>
        set((state) => {
          const current =
            state.encounters[mapId] ?? emptyEncounter();

          if (current.started) {
            return {
              encounters: {
                ...state.encounters,
                [mapId]: {
                  ...current,
                  started: false,
                },
              },
            };
          }

          if (current.entries.length === 0) {
            return {};
          }

          const entries = sortEntries(current.entries);

          return {
            encounters: {
              ...state.encounters,
              [mapId]: {
                ...current,
                entries,
                started: true,
                round: 1,
                activeEntryId: entries[0]?.id ?? null,
              },
            },
          };
        }),

      nextTurn: (mapId) =>
        set((state) => {
          const current =
            state.encounters[mapId] ?? emptyEncounter();

          if (!current.started || current.entries.length === 0) {
            return {};
          }

          const entries = sortEntries(current.entries);

          const currentIndex = entries.findIndex(
            (entry) => entry.id === current.activeEntryId,
          );

          const nextIndex = currentIndex + 1;

          if (nextIndex >= entries.length) {
            return {
              encounters: {
                ...state.encounters,
                [mapId]: {
                  ...current,
                  entries,
                  round: current.round + 1,
                  activeEntryId: entries[0]?.id ?? null,
                },
              },
            };
          }

          return {
            encounters: {
              ...state.encounters,
              [mapId]: {
                ...current,
                entries,
                activeEntryId: entries[nextIndex]?.id ?? null,
              },
            },
          };
        }),

      resetTurn: (mapId) =>
        set((state) => {
          const current =
            state.encounters[mapId] ?? emptyEncounter();

          if (current.entries.length === 0) {
            return {};
          }

          const entries = sortEntries(current.entries);

          return {
            encounters: {
              ...state.encounters,
              [mapId]: {
                ...current,
                entries,
                round: 1,
                activeEntryId: entries[0]?.id ?? null,
              },
            },
          };
        }),

      clearEncounter: (mapId) =>
        set((state) => {
          return {
            encounters: {
              ...state.encounters,
              [mapId]: emptyEncounter(),
            },
          };
        }),

      pruneMissingTokens: (mapId, validTokenIds) =>
        set((state) => {
          const current =
            state.encounters[mapId] ?? emptyEncounter();

          const validIds = new Set(validTokenIds);

          const entries = current.entries.filter((entry) =>
            validIds.has(entry.tokenId),
          );

          if (entries.length === current.entries.length) {
            return {};
          }

          let activeEntryId = current.activeEntryId;

          if (
            activeEntryId &&
            !entries.some((entry) => entry.id === activeEntryId)
          ) {
            activeEntryId = sortEntries(entries)[0]?.id ?? null;
          }

          return {
            encounters: {
              ...state.encounters,
              [mapId]: {
                ...current,
                entries,
                activeEntryId,
              },
            },
          };
        }),
    }),
    {
      name: 'dndstudio.encounter',
      partialize: (state) => ({
        selectedMapId: state.selectedMapId,
        encounters: state.encounters,
      }),
    },
  ),
);