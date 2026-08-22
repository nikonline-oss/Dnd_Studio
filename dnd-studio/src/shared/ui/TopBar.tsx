import { useState } from 'react';

import { useActiveCampaign, useCloseCampaign, useCreateCampaign, useExportCampaign, useImportCampaign, usePluginThemes } from '../api/hooks';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useUiStore } from '../stores/ui';
import { useWorkspaceStore } from '../stores/workspace';

import { Menu, MenuBar, MenuDivider, MenuItem } from './menu/Menu';
import { ThemeSelector } from './ThemeSelector';
import { ConfirmDialog } from './ConfirmDialog';
import { CreateMapModal } from '../../features/map/CreateMapModal';
import { CreateCharacterModal } from '../../features/character/CreateCharacterModal';

export function TopBar() {
  const { data: activeCampaign } = useActiveCampaign();
  const activeProfileId = useUiStore((state) => state.activeProfileId);
  const activeProfileName = useUiStore((state) => state.activeProfileName);

  const themeMode = useUiStore((state) => state.themeMode);
  const setThemeMode = useUiStore((state) => state.setThemeMode);
  const pluginThemeId = useUiStore((state) => state.pluginThemeId);
  const setPluginThemeId = useUiStore((state) => state.setPluginThemeId);

  const toggleLeftPanel = useUiStore((state) => state.toggleLeft);
  const toggleRightPanel = useUiStore((state) => state.toggleRight);
  const toggleBottomPanel = useUiStore((state) => state.toggleBottom);

  const closeActiveTab = useWorkspaceStore((state) => state.closeActiveTab);
  const tabs = useWorkspaceStore((state) => state.tabs);

  const createCampaign = useCreateCampaign();
  const exportCampaign = useExportCampaign();
  const importCampaign = useImportCampaign();
  const closeCampaign = useCloseCampaign();
  const { data: pluginThemes = [] } = usePluginThemes(true);

  // Модалки
  const [isCreateMapOpen, setIsCreateMapOpen] = useState(false);
  const [isCreateCharacterOpen, setIsCreateCharacterOpen] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  // ============================================
  // Handlers
  // ============================================

  const handleNewCampaign = () => {
    const name = window.prompt('Campaign name:');
    if (name && activeProfileId) {
      createCampaign.mutate({ name, profileId: activeProfileId });
    }
  };

  const handleExportCampaign = async () => {
    if (!activeCampaign) return;

    // TODO: использовать showSaveDialog из Tauri
    const defaultName = `${activeCampaign.name}.dndcampaign`;
    const path = window.prompt('Export to (path):', defaultName);
    if (path) {
      try {
        await exportCampaign.mutateAsync(path);
        alert('Campaign exported successfully');
      } catch (e) {
        alert(`Export failed: ${e instanceof Error ? e.message : 'Unknown error'}`);
      }
    }
  };

  const handleImportCampaign = async () => {
    // TODO: использовать showOpenDialog из Tauri
    const path = window.prompt('Import from (path to .dndcampaign):');
    if (path && activeProfileId) {
      try {
        await importCampaign.mutateAsync({
          sourcePath: path,
          profileId: activeProfileId,
        });
      } catch (e) {
        alert(`Import failed: ${e instanceof Error ? e.message : 'Unknown error'}`);
      }
    }
  };

  const handleNewMap = () => setIsCreateMapOpen(true);
  const handleNewCharacter = () => setIsCreateCharacterOpen(true);

  // ============================================
  // Logout
  // ============================================

  const setActiveProfile = useUiStore((state) => state.setActiveProfile);

  const handleLogout = () => {
    setIsLogoutDialogOpen(true);
  };

  const confirmLogout = () => {
    // Закрываем текущую кампанию
    closeCampaign.mutate();

    // Сбрасываем профиль
    setActiveProfile(null, null);

    // Закрываем все вкладки
    const workspaceStore = useWorkspaceStore.getState();
    workspaceStore.tabs.forEach((tab) => {
      workspaceStore.closeTab(tab.id);
    });

    setIsLogoutDialogOpen(false);
  };

  // ============================================
  // Keyboard Shortcuts
  // ============================================

  useKeyboardShortcuts([
    // File
    { key: 'KeyN', ctrl: true, handler: handleNewCampaign, label: 'New Campaign' },
    { key: 'KeyE', ctrl: true, shift: true, handler: handleExportCampaign, label: 'Export Campaign' },
    { key: 'KeyI', ctrl: true, shift: true, handler: handleImportCampaign, label: 'Import Campaign' },

    // View
    { key: 'KeyB', ctrl: true, handler: toggleLeftPanel, label: 'Toggle Left Panel' },
    { key: 'KeyB', ctrl: true, shift: true, handler: toggleRightPanel, label: 'Toggle Right Panel' },
    { key: 'KeyJ', ctrl: true, handler: toggleBottomPanel, label: 'Toggle Bottom Panel' },

    // Tabs
    { key: 'KeyT', ctrl: true, handler: () => {}, label: 'New Tab' },
    { key: 'KeyW', ctrl: true, handler: closeActiveTab, label: 'Close Tab' },

    // Create
    { key: 'KeyM', ctrl: true, shift: true, handler: handleNewMap, label: 'New Map' },
    { key: 'KeyC', ctrl: true, shift: true, handler: handleNewCharacter, label: 'New Character' },
  ]);

  // ============================================
  // Breadcrumbs
  // ============================================

  const breadcrumbs = [
    activeProfileName ?? 'No profile',
    activeCampaign?.name,
    tabs.length > 0 ? tabs[0].title : null,
  ].filter(Boolean) as string[];

  // ============================================
  // Render
  // ============================================

  return (
    <div className="topbar">
      <MenuBar>
        <Menu id="file" label="File">
          <MenuItem
            label="New Campaign"
            shortcut={{ ctrl: true, key: 'n' }}
            onClick={handleNewCampaign}
          />
          <MenuDivider />
          <MenuItem
            label="New Map"
            shortcut={{ ctrl: true, shift: true, key: 'm' }}
            onClick={handleNewMap}
            disabled={!activeCampaign}
          />
          <MenuItem
            label="New Character"
            shortcut={{ ctrl: true, shift: true, key: 'c' }}
            onClick={handleNewCharacter}
            disabled={!activeCampaign}
          />
          <MenuDivider />
          <MenuItem
            label="Export Campaign"
            shortcut={{ ctrl: true, shift: true, key: 'e' }}
            onClick={handleExportCampaign}
            disabled={!activeCampaign}
          />
          <MenuItem
            label="Import Campaign"
            shortcut={{ ctrl: true, shift: true, key: 'i' }}
            onClick={handleImportCampaign}
          />
          <MenuDivider />
          <MenuItem
            label="Close Campaign"
            onClick={() => closeCampaign.mutate()}
            disabled={closeCampaign.isPending}
          />
        </Menu>

        <Menu id="view" label="View">
          <MenuItem
            label="Toggle Left Panel"
            shortcut={{ ctrl: true, key: 'b' }}
            onClick={toggleLeftPanel}
          />
          <MenuItem
            label="Toggle Right Panel"
            shortcut={{ ctrl: true, shift: true, key: 'b' }}
            onClick={toggleRightPanel}
          />
          <MenuItem
            label="Toggle Bottom Panel"
            shortcut={{ ctrl: true, key: 'j' }}
            onClick={toggleBottomPanel}
          />
          <MenuDivider />
          <MenuItem
            label={`Theme: ${themeMode.charAt(0).toUpperCase() + themeMode.slice(1)}`}
            submenu={
              <ThemeSelector
                currentMode={themeMode}
                currentPluginThemeId={pluginThemeId}
                pluginThemes={pluginThemes}
                onModeChange={setThemeMode}
                onPluginThemeChange={setPluginThemeId}
              />
            }
          />
        </Menu>

        <Menu id="tools" label="Tools">
          <MenuItem label="Dice Roller" onClick={() => {}} disabled />
          <MenuItem label="Initiative Tracker" onClick={() => {}} disabled />
          <MenuDivider />
          <MenuItem label="Plugins" onClick={() => {}} disabled />
          <MenuItem label="Connection" onClick={() => {}} disabled />
        </Menu>

        <Menu id="help" label="Help">
          <MenuItem label="About DndStudio" onClick={() => {}} />
          <MenuItem label="Documentation" onClick={() => {}} disabled />
          <MenuItem label="Report Issue" onClick={() => {}} disabled />
        </Menu>
      </MenuBar>

      {/* Breadcrumbs */}
      <div className="topbar-breadcrumbs">
        {breadcrumbs.map((crumb, i) => (
          <span key={i} className="topbar-breadcrumb">
            {i > 0 && <span className="topbar-breadcrumb-sep">›</span>}
            <span className="topbar-breadcrumb-text">{crumb}</span>
          </span>
        ))}

        {/* Кнопка выхода из профиля */}
        {activeProfileId && (
          <button
            type="button"
            className="topbar-logout-btn"
            onClick={handleLogout}
            title="Выйти из профиля"
          >
            🚪
          </button>
        )}
      </div>

      {/* Диалог подтверждения выхода */}
      <ConfirmDialog
        open={isLogoutDialogOpen}
        title="Выйти из профиля?"
        message="Все несохранённые изменения будут потеряны. Вы уверены?"
        confirmLabel="Выйти"
        cancelLabel="Отмена"
        destructive
        onConfirm={confirmLogout}
        onCancel={() => setIsLogoutDialogOpen(false)}
      />

      {/* Модалки */}
      <CreateMapModal
        open={isCreateMapOpen}
        onClose={() => setIsCreateMapOpen(false)}
      />
      <CreateCharacterModal
        open={isCreateCharacterOpen}
        onClose={() => setIsCreateCharacterOpen(false)}
      />
    </div>
  );
}
