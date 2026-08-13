import { useEffect } from 'react';

import { AppShell } from './AppShell';

import { logDebug } from '../shared/lib/debug';
import { useAutoOpenLastCampaign } from '../shared/hooks/useAutoOpenLastCampaign';
import { useGlobalShortcuts } from '../shared/hooks/useGlobalShortcuts';
import { useThemeEffect } from '../shared/hooks/useThemeEffect';
import { useWorkspaceHydration } from '../shared/hooks/useWorkspaceHydration';
import { useWorkspaceStore } from '../shared/stores/workspace';

export default function App() {
  const workspaceReady = useWorkspaceHydration();

  useThemeEffect();
  useGlobalShortcuts();
  useAutoOpenLastCampaign(workspaceReady);

  useEffect(() => {
    if (!workspaceReady) {
      return;
    }

    const state = useWorkspaceStore.getState();

    logDebug('app', 'workspace ready', {
      campaignId: state.campaignId,
      lastCampaignId: state.lastCampaignId,
      tabsCount: state.tabs.length,
      activeTabId: state.activeTabId,
    });

    (window as any).__DND_STUDIO_DEBUG__ = {
      getWorkspaceState: () => useWorkspaceStore.getState(),
      getWorkspaceStorage: () => {
        try {
          return JSON.parse(
            localStorage.getItem('dndstudio.workspace') ?? 'null',
          );
        } catch (error) {
          return {
            error: String(error),
          };
        }
      },
      clearWorkspaceStorage: () => {
        localStorage.removeItem('dndstudio.workspace');
      },
      setDebugEnabled: (value: boolean) => {
        localStorage.setItem('dndstudio.debug', value ? '1' : '0');
      },
    };
  }, [workspaceReady]);

  if (!workspaceReady) {
    return (
      <main className="center-area">
        <div className="empty-state">Restoring workspace…</div>
      </main>
    );
  }

  return <AppShell />;
}