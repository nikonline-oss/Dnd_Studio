import { useEffect, useState } from 'react';

import { logDebug, logError } from '../lib/debug';
import { useWorkspaceStore } from '../stores/workspace';

export function useWorkspaceHydration(): boolean {
  const [hydrated, setHydrated] = useState<boolean>(() =>
    useWorkspaceStore.persist.hasHydrated(),
  );

  useEffect(() => {
    if (hydrated) {
      return;
    }

    logDebug('workspace', 'waiting for persist hydration');

    const unsubscribe = useWorkspaceStore.persist.onFinishHydration(() => {
      logDebug('workspace', 'persist hydration finished');
      setHydrated(true);
    });

    const timeout = window.setTimeout(() => {
      if (!useWorkspaceStore.persist.hasHydrated()) {
        logError(
          'workspace',
          'persist hydration timeout, continuing without waiting',
        );
        setHydrated(true);
      }
    }, 700);

    if (useWorkspaceStore.persist.hasHydrated()) {
      setHydrated(true);
    }

    return () => {
      unsubscribe();
      window.clearTimeout(timeout);
    };
  }, [hydrated]);

  return hydrated;
}