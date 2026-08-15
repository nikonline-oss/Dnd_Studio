import { useEffect } from 'react';

import { usePluginThemeCss } from '../api/hooks';
import { useUiStore } from '../stores/ui';

const STYLE_ELEMENT_ID = 'dndstudio-plugin-theme';

export function usePluginTheme() {
  const themeMode = useUiStore((state) => state.themeMode);
  const pluginThemeId = useUiStore((state) => state.pluginThemeId);

  const [pluginId, themeKey] = pluginThemeId
    ? pluginThemeId.split('::')
    : [null, null];

  const isActivePluginTheme = themeMode === 'plugin' && Boolean(pluginId && themeKey);

  const { data: themeCss } = usePluginThemeCss(
    isActivePluginTheme ? pluginId! : undefined,
    isActivePluginTheme ? themeKey! : undefined,
  );

  useEffect(() => {
    // Удаляем старый style-элемент
    const existing = document.getElementById(STYLE_ELEMENT_ID);
    if (existing) {
      existing.remove();
    }

    if (!isActivePluginTheme || !themeCss) {
      return;
    }

    // Создаём новый style-элемент с CSS темы
    const style = document.createElement('style');
    style.id = STYLE_ELEMENT_ID;
    style.textContent = themeCss;
    document.head.appendChild(style);

    // Устанавливаем data-theme
    document.documentElement.dataset.theme = `plugin:${themeKey}`;
  }, [isActivePluginTheme, themeCss, themeKey]);

  return { isActivePluginTheme };
}