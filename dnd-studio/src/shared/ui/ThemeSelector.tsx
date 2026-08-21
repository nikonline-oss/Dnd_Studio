import { useMemo } from 'react';

import type { ThemeMode } from '../theme/theme';
import type { PluginThemeInfo } from '../api/bindings';

interface ThemeSelectorProps {
  currentMode: ThemeMode;
  currentPluginThemeId: string | null;
  pluginThemes: PluginThemeInfo[];
  onModeChange: (mode: ThemeMode) => void;
  onPluginThemeChange: (pluginThemeId: string | null) => void;
}

export function ThemeSelector({
  currentMode,
  currentPluginThemeId,
  pluginThemes,
  onModeChange,
  onPluginThemeChange,
}: ThemeSelectorProps) {
  const grouped = useMemo(() => {
    const groups = new Map<string, PluginThemeInfo[]>();

    for (const pt of pluginThemes) {
      const list = groups.get(pt.pluginId) ?? [];
      list.push(pt);
      groups.set(pt.pluginId, list);
    }

    return groups;
  }, [pluginThemes]);

  return (
    <>
      <BaseThemeOption
        value="system"
        label="System"
        isActive={currentMode === 'system'}
        onClick={() => {
          onModeChange('system');
          onPluginThemeChange(null);
        }}
      />
      <BaseThemeOption
        value="light"
        label="Light"
        isActive={currentMode === 'light'}
        onClick={() => {
          onModeChange('light');
          onPluginThemeChange(null);
        }}
      />
      <BaseThemeOption
        value="dark"
        label="Dark"
        isActive={currentMode === 'dark'}
        onClick={() => {
          onModeChange('dark');
          onPluginThemeChange(null);
        }}
      />

      <BaseThemeOption
        value="plugin"
        label="Plugin"
        isActive={currentMode === 'plugin'}
        onClick={() => {
          onModeChange('plugin');
        }}
      />

      {grouped.size > 0 && (
        <div className="menu-group" style={{ borderTop: '1px solid var(--border-gold-strong)', margin: '4px 0', paddingTop: '4px' }}>
          {Array.from(grouped.entries()).map(([pluginId, themes]) => (
            <div key={pluginId} className="menu-group" style={{ marginLeft: '8px' }}>
              <div className="menu-group-label">{pluginId}</div>
              {themes.map((pt) => {
                const pluginThemeId = `${pt.pluginId}::${pt.themeKey}`;
                const isActive = currentMode === 'plugin' && currentPluginThemeId === pluginThemeId;

                return (
                  <BaseThemeOption
                    key={pt.themeKey}
                    value={pt.themeKey}
                    label={pt.themeKey}
                    isActive={isActive}
                    onClick={() => {
                      onPluginThemeChange(pluginThemeId);
                      if (currentMode !== 'plugin') {
                        onModeChange('plugin');
                      }
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      )}
    </>
  );
}

interface BaseThemeOptionProps {
  value: string;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

function BaseThemeOption({ label, isActive, onClick }: BaseThemeOptionProps) {
  return (
    <button
      type="button"
      className={`menu-item ${isActive ? 'selected' : ''}`}
      role="menuitem"
      onClick={onClick}
    >
      <span className="menu-item-label">{label}</span>
      {isActive && <span className="menu-item-check">✓</span>}
    </button>
  );
}
