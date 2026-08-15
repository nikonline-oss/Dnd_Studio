import { useEffect } from 'react';

import { AppShell } from './AppShell';

import { useAutoOpenLastCampaign } from '../shared/hooks/useAutoOpenLastCampaign';
import { useGlobalShortcuts } from '../shared/hooks/useGlobalShortcuts';
import { usePluginDragDrop } from '../shared/hooks/usePluginDragDrop';
import { useThemeEffect } from '../shared/hooks/useThemeEffect';
import { logDebug } from '../shared/lib/debug';
import { useWorkspaceStore } from '../shared/stores/workspace';
import { usePluginTheme } from '../shared/hooks/usePluginTheme';

export default function App() {
  const workspaceReady = useWorkspaceStore.persist.hasHydrated();

  useThemeEffect();
  usePluginTheme();
  useGlobalShortcuts();
  useAutoOpenLastCampaign(workspaceReady);

  const {
    isDragging,
    isInstalling,
    dropMessage,
    canInstall,
  } = usePluginDragDrop();

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

  return (
    <>
      <AppShell />

      {isDragging && (
        <div className="plugin-drop-overlay">
          <div className="plugin-drop-card">
            {canInstall
              ? 'Drop .dndplugin to install'
              : 'Open a campaign before installing plugins'}
          </div>
        </div>
      )}

      {dropMessage && (
        <div className="plugin-drop-toast">
          {dropMessage}
        </div>
      )}
    </>
  );
}