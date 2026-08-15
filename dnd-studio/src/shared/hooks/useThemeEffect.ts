import { useEffect } from 'react';

import { useUiStore } from '../stores/ui';

function applyTheme() {
  const themeMode = useUiStore.getState().themeMode;
  const pluginThemeId = useUiStore.getState().pluginThemeId;

  if (themeMode === 'plugin' && pluginThemeId) {
    return;
  }

  const media = window.matchMedia('(prefers-color-scheme: dark)');

  const resolved =
    themeMode === 'system' ? (media.matches ? 'dark' : 'light') : themeMode;

  document.documentElement.dataset.theme = resolved;
}

export function useThemeEffect() {
  useEffect(() => {
    applyTheme();

    const unsubscribe = useUiStore.subscribe(() => {
      applyTheme();
    });

    const media = window.matchMedia('(prefers-color-scheme: dark)');

    const listener = () => {
      applyTheme();
    };

    media.addEventListener('change', listener);

    return () => {
      unsubscribe();
      media.removeEventListener('change', listener);
    };
  }, []);
}