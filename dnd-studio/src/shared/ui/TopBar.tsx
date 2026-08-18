import { useUiStore } from '../stores/ui';
import { useActiveCampaign, useCloseCampaign } from '../api/hooks';
import { save } from '@tauri-apps/plugin-dialog';
import { useExportCampaign } from '../api/hooks';
import { usePluginThemes } from '../api/hooks';

const menuItems = ['File', 'Edit', 'View', 'Tools', 'Help'];

export function TopBar() {
  const themeMode = useUiStore((state) => state.themeMode);
  const setThemeMode = useUiStore((state) => state.setThemeMode);

  const toggleLeft = useUiStore((state) => state.toggleLeft);
  const toggleRight = useUiStore((state) => state.toggleRight);
  const toggleBottom = useUiStore((state) => state.toggleBottom);

  const { data: activeCampaign } = useActiveCampaign();
  const closeCampaign = useCloseCampaign();

  const exportCampaign = useExportCampaign();

  const { data: pluginThemes = [] } = usePluginThemes(Boolean(activeCampaign));

  const pluginThemeId = useUiStore((state) => state.pluginThemeId);
  const setPluginThemeId = useUiStore((state) => state.setPluginThemeId);

  const activeProfileId = useUiStore((state) => state.activeProfileId);
  const activeProfileName = useUiStore((state) => state.activeProfileName);
  const setActiveProfile = useUiStore((state) => state.setActiveProfile);

  const handleSwitchProfile = () => {
    if (window.confirm('Switch profile? Unsaved changes will be lost.')) {
      setActiveProfile(null, null);
    }
  };

  const handleThemeChange = (value: string) => {
    if (value === 'system' || value === 'light' || value === 'dark') {
      setThemeMode(value);
      setPluginThemeId(null);
    } else {
      // value формат: "pluginId::themeKey"
      setThemeMode('plugin');
      setPluginThemeId(value);
    }
  };

  const currentThemeValue =
    themeMode === 'plugin' && pluginThemeId
      ? pluginThemeId
      : themeMode;

  const handleExport = async () => {
    if (!activeCampaign) return;

    try {
      const destination = await save({
        defaultPath: `${activeCampaign.name.replace(/\s+/g, '-').toLowerCase()}.dndcampaign`,
        filters: [
          {
            name: 'DndStudio Campaign',
            extensions: ['dndcampaign'],
          },
        ],
      });

      if (typeof destination === 'string') {
        exportCampaign.mutate(destination);
      }
    } catch (error) {
      console.error('Export failed', error);
    }
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <span className="topbar-brand">DndStudio</span>

        <nav className="topbar-menu">
          {menuItems.map((item) => (
            <button key={item} className="menu-item" type="button">
              {item}
            </button>
          ))}
        </nav>
      </div>

      <div className="topbar-center">
        {activeCampaign ? (
          <div className="topbar-campaign">
            <span className="breadcrumb">{activeCampaign.name}</span>

            <button
              type="button"
              onClick={() => closeCampaign.mutate()}
              disabled={closeCampaign.isPending}
            >
              {closeCampaign.isPending ? 'Closing…' : 'Switch campaign'}
            </button>
            <button
              type="button"
              onClick={handleExport}
              disabled={exportCampaign.isPending}
            >
              {exportCampaign.isPending ? 'Exporting…' : 'Export'}
            </button>
          </div>
        ) : (
          <span className="breadcrumb">No campaign</span>
        )}
      </div>

      <div className="topbar-right">
        <button type="button" onClick={toggleLeft}>
          Left
        </button>

        <button type="button" onClick={toggleBottom}>
          Bottom
        </button>

        <button type="button" onClick={toggleRight}>
          Right
        </button>
        <div className="topbar-profile">
          <span className="topbar-profile-name">{activeProfileName}</span>
          <button type="button" onClick={handleSwitchProfile} title="Switch profile">
            👤
          </button>
        </div>

        <select
          value={currentThemeValue}
          onChange={(event) => handleThemeChange(event.target.value)}
        >
          <option value="system">System</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>

          {pluginThemes.length > 0 && (
            <optgroup label="Plugin themes">
              {pluginThemes.map((theme) => {
                const value = `${theme.pluginId}::${theme.themeKey}`;
                return (
                  <option key={value} value={value}>
                    {theme.themeKey}
                  </option>
                );
              })}
            </optgroup>
          )}
        </select>
      </div>
    </header>
  );
}