import { getCurrentWindow } from '@tauri-apps/api/window';
import { useCallback, useEffect, useRef, useState } from 'react';

import {
  useActiveCampaign,
  useInstallPlugin,
} from '../api/hooks';

interface DragDropPayload {
  type: 'enter' | 'over' | 'drop' | 'leave';
  paths?: string[];
}

export function usePluginDragDrop() {
  const { data: activeCampaign } = useActiveCampaign();
  const installPlugin = useInstallPlugin();

  const [isDragging, setIsDragging] = useState(false);
  const [dropMessage, setDropMessage] = useState<string | null>(null);

  const activeCampaignRef = useRef(activeCampaign);
  const messageTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    activeCampaignRef.current = activeCampaign;
  }, [activeCampaign]);

  const showMessage = useCallback((message: string) => {
    setDropMessage(message);

    if (messageTimeoutRef.current) {
      window.clearTimeout(messageTimeoutRef.current);
    }

    messageTimeoutRef.current = window.setTimeout(() => {
      setDropMessage(null);
    }, 3500);
  }, []);

  const handleDropPaths = useCallback(
    async (paths: string[]) => {
      const pluginPaths = paths.filter((path) =>
        path.toLowerCase().endsWith('.dndplugin'),
      );

      if (pluginPaths.length === 0) {
        showMessage('No .dndplugin files found');
        return;
      }

      if (!activeCampaignRef.current) {
        showMessage('Open a campaign before installing plugins');
        return;
      }

      try {
        for (const pluginPath of pluginPaths) {
          await installPlugin.mutateAsync(pluginPath);
        }

        showMessage(
          pluginPaths.length === 1
            ? 'Plugin installed'
            : `${pluginPaths.length} plugins installed`,
        );
      } catch (error) {
        console.error('Failed to install plugin from drag-and-drop', error);
        showMessage('Plugin installation failed');
      }
    },
    [installPlugin.mutateAsync, showMessage],
  );

  // Запрещаем браузерное поведение drag-and-drop.
  useEffect(() => {
    const prevent = (event: Event) => {
      event.preventDefault();
      event.stopPropagation();
    };

    window.addEventListener('dragover', prevent);
    window.addEventListener('drop', prevent);

    return () => {
      window.removeEventListener('dragover', prevent);
      window.removeEventListener('drop', prevent);
    };
  }, []);

  // Подписка на Tauri drag-and-drop события.
  useEffect(() => {
    let unlisten: (() => void) | undefined;
    let cancelled = false;

    const windowInstance = getCurrentWindow();

    const api = windowInstance as unknown as {
      onDragDropEvent?: (
        handler: (event: { payload: DragDropPayload }) => void,
      ) => Promise<() => void>;
    };

    if (typeof api.onDragDropEvent !== 'function') {
      return;
    }

    const setup = async () => {
      const dispose = await api.onDragDropEvent!((event) => {
        const payload = event.payload;

        if (!payload) {
          return;
        }

        if (payload.type === 'enter') {
          setIsDragging(true);
          return;
        }

        if (payload.type === 'leave') {
          setIsDragging(false);
          return;
        }

        if (payload.type === 'drop') {
          setIsDragging(false);

          const paths = payload.paths ?? [];

          void handleDropPaths(paths);
        }
      });

      if (cancelled) {
        dispose();
      } else {
        unlisten = dispose;
      }
    };

    void setup();

    return () => {
      cancelled = true;

      if (unlisten) {
        unlisten();
      }
    };
  }, [handleDropPaths]);

  return {
    isDragging,
    isInstalling: installPlugin.isPending,
    dropMessage,
    canInstall: Boolean(activeCampaign),
  };
}