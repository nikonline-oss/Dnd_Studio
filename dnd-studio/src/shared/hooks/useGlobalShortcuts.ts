import { useEffect } from 'react';

import { useUiStore } from '../stores/ui';
import { useWorkspaceStore } from '../stores/workspace';

export function useGlobalShortcuts() {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const mod = event.ctrlKey || event.metaKey;

      if (!mod) {
        return;
      }

      const ui = useUiStore.getState();
      const workspace = useWorkspaceStore.getState();

      // Ctrl+B / Cmd+B — left panel
      if (event.code === 'KeyB' && !event.shiftKey) {
        event.preventDefault();
        event.stopPropagation();
        ui.toggleLeft();
        return;
      }

      // Ctrl+Shift+B / Cmd+Shift+B — right panel
      if (event.code === 'KeyB' && event.shiftKey) {
        event.preventDefault();
        event.stopPropagation();
        ui.toggleRight();
        return;
      }

      // Ctrl+J / Cmd+J — bottom panel
      if (event.code === 'KeyJ') {
        event.preventDefault();
        event.stopPropagation();
        ui.toggleBottom();
        return;
      }

      // Ctrl+W / Cmd+W — close active tab
      if (event.code === 'KeyW') {
        event.preventDefault();
        event.stopPropagation();
        workspace.closeActiveTab();
        return;
      }

      // Ctrl+T / Cmd+T — new placeholder tab, если открыта кампания
      if (event.code === 'KeyT') {
        event.preventDefault();
        event.stopPropagation();

        if (workspace.campaignId) {
          workspace.openTab({
            id: `placeholder:${Date.now()}`,
            kind: 'placeholder',
            title: 'New Tab',
          });
        }

        return;
      }
    };

    window.addEventListener('keydown', onKeyDown, {
      capture: true,
      passive: false,
    });

    return () => {
      window.removeEventListener('keydown', onKeyDown, {
        capture: true,
      });
    };
  }, []);
}