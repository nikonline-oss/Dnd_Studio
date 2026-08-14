import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { logDebug, logError } from '../lib/debug';

export type WorkspaceTabKind =
  | 'map'
  | 'journal'
  | 'character'
  | 'placeholder';

export interface WorkspaceTab {
  id: string;
  kind: WorkspaceTabKind;
  title: string;
  entityId?: string;
}

interface WorkspaceState {
  campaignId: string | null;
  lastCampaignId: string | null;

  tabs: WorkspaceTab[];
  activeTabId: string | null;

  bindCampaign: (campaignId: string | null) => void;

  setLastCampaignId: (campaignId: string) => void;
  clearLastCampaign: () => void;

  openTab: (tab: WorkspaceTab) => void;
  closeTab: (tabId: string) => void;
  closeActiveTab: () => void;
  setActiveTab: (tabId: string) => void;

  openMapTab: (map: { id: string; name: string }) => void;

  openJournalTab: (entry: { id: string; title: string }) => void;
  renameTabByEntity: (
    kind: WorkspaceTabKind,
    entityId: string,
    title: string,
  ) => void;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      campaignId: null,
      lastCampaignId: null,

      tabs: [],
      activeTabId: null,

      bindCampaign: (campaignId) =>
        set((state) => {
          logDebug('workspace', 'bindCampaign request', {
            from: state.campaignId,
            to: campaignId,
            lastCampaignId: state.lastCampaignId,
            tabsCount: state.tabs.length,
          });

          if (state.campaignId === campaignId) {
            logDebug('workspace', 'bindCampaign skipped, already same');
            return {};
          }

          logDebug('workspace', 'bindCampaign resets tabs', {
            from: state.campaignId,
            to: campaignId,
          });

          return {
            campaignId,
            tabs: [],
            activeTabId: null,
          };
        }),

      setLastCampaignId: (campaignId) => {
        logDebug('workspace', 'setLastCampaignId', campaignId);

        set({
          lastCampaignId: campaignId,
        });

        window.setTimeout(() => {
          try {
            logDebug(
              'workspace',
              'storage after setLastCampaignId',
              localStorage.getItem('dndstudio.workspace'),
            );
          } catch (error) {
            logError('workspace', 'failed to read workspace storage', error);
          }
        }, 0);
      },

      clearLastCampaign: () => {
        logDebug('workspace', 'clearLastCampaign');

        set({
          lastCampaignId: null,
        });

        window.setTimeout(() => {
          try {
            logDebug(
              'workspace',
              'storage after clearLastCampaign',
              localStorage.getItem('dndstudio.workspace'),
            );
          } catch (error) {
            logError('workspace', 'failed to read workspace storage', error);
          }
        }, 0);
      },

      openTab: (tab) =>
        set((state) => {
          const alreadyExists = state.tabs.some((item) => item.id === tab.id);

          logDebug('workspace', 'openTab', {
            tabId: tab.id,
            title: tab.title,
            alreadyExists,
            tabsCount: state.tabs.length,
          });

          if (alreadyExists) {
            return {
              activeTabId: tab.id,
            };
          }

          return {
            tabs: [...state.tabs, tab],
            activeTabId: tab.id,
          };
        }),

      closeTab: (tabId) =>
        set((state) => {
          const index = state.tabs.findIndex((tab) => tab.id === tabId);

          logDebug('workspace', 'closeTab', {
            tabId,
            index,
            tabsCount: state.tabs.length,
          });

          if (index === -1) {
            return {};
          }

          const tabs = state.tabs.filter((tab) => tab.id !== tabId);

          let activeTabId = state.activeTabId;

          if (state.activeTabId === tabId) {
            activeTabId =
              tabs[index]?.id ??
              tabs[index - 1]?.id ??
              null;
          }

          return {
            tabs,
            activeTabId,
          };
        }),

      closeActiveTab: () => {
        const { activeTabId, closeTab } = get();

        logDebug('workspace', 'closeActiveTab', {
          activeTabId,
        });

        if (activeTabId) {
          closeTab(activeTabId);
        }
      },

      setActiveTab: (tabId) => {
        logDebug('workspace', 'setActiveTab', {
          tabId,
        });

        set({
          activeTabId: tabId,
        });
      },

      openMapTab: (map) => {
        logDebug('workspace', 'openMapTab', map);

        get().openTab({
          id: `map:${map.id}`,
          kind: 'map',
          title: map.name,
          entityId: map.id,
        });
      },

      openJournalTab: (entry) => {
        logDebug('workspace', 'openJournalTab', entry);

        get().openTab({
          id: `journal:${entry.id}`,
          kind: 'journal',
          title: entry.title || 'Journal',
          entityId: entry.id,
        });
      },

      renameTabByEntity: (kind, entityId, title) =>
        set((state) => ({
          tabs: state.tabs.map((tab) => {
            if (tab.kind === kind && tab.entityId === entityId) {
              return {
                ...tab,
                title,
              };
            }

            return tab;
          }),
        })),
    }),
    {
      name: 'dndstudio.workspace',
      partialize: (state) => ({
        campaignId: state.campaignId,
        lastCampaignId: state.lastCampaignId,
        tabs: state.tabs,
        activeTabId: state.activeTabId,
      }),
    },
  ),
);