import { useUiStore } from '../stores/ui';
import { type ThemeMode } from '../theme/theme';
import { useActiveCampaign, useCloseCampaign } from '../api/hooks';
import { save } from '@tauri-apps/plugin-dialog';
import { useExportCampaign } from '../api/hooks';

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

        <select
          value={themeMode}
          onChange={(event) => setThemeMode(event.target.value as ThemeMode)}
        >
          <option value="system">System</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>
    </header>
  );
}