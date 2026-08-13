import { useLayoutEffect } from 'react';

import { useUiStore } from '../stores/ui';
import { applyThemeMode } from '../theme/theme';

export function useThemeEffect() {
  useLayoutEffect(() => {
    applyThemeMode(useUiStore.getState().themeMode);

    const unsubscribe = useUiStore.subscribe(() => {
      applyThemeMode(useUiStore.getState().themeMode);
    });

    const media = window.matchMedia('(prefers-color-scheme: dark)');

    const onSystemThemeChange = () => {
      if (useUiStore.getState().themeMode === 'system') {
        applyThemeMode(useUiStore.getState().themeMode);
      }
    };

    media.addEventListener('change', onSystemThemeChange);

    return () => {
      unsubscribe();
      media.removeEventListener('change', onSystemThemeChange);
    };
  }, []);
}