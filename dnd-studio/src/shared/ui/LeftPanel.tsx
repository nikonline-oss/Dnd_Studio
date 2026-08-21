import { useState } from 'react';
import { open } from '@tauri-apps/plugin-dialog';
import {
  DependencyCheckResult,
  useActiveCampaign,
  useCompendiums,
  useDeleteCompendium,
  useInstallBuiltinPlugin,
  useInstalledPlugins,
  useInstallPlugin,
  useSetPluginActive,
  useUninstallPlugin,
  useUpdateCompendium,
  useValidatePluginDependencies,
} from '../api/hooks';
import { useUiStore } from '../stores/ui';
import { useWorkspaceStore } from '../stores/workspace';
import { CampaignTree } from '../../features/navigator/CampaignTree';
import { CreateCompendiumModal } from '../../features/compendium/CreateCompendiumModal';


function parsePluginManifest(rawJson: string): {
  name?: string;
  description?: string;
  author?: string;
  dependencies?: Array<{ id: string; version: string }>;
} | null {
  try {
    return JSON.parse(rawJson);
  } catch {
    return null;
  }
}

function PluginsPanel() {
  const { data: activeCampaign } = useActiveCampaign();

  const { data: plugins = [], isLoading } = useInstalledPlugins(
    Boolean(activeCampaign),
  );

  const installPlugin = useInstallPlugin();
  const installBuiltinPlugin = useInstallBuiltinPlugin();
  const setPluginActive = useSetPluginActive();
  const uninstallPlugin = useUninstallPlugin();
  const validateDeps = useValidatePluginDependencies();

  // Состояние для отображения результата проверки зависимостей
  const [depCheckResult, setDepCheckResult] = useState<{
    pluginId: string;
    result: DependencyCheckResult;
  } | null>(null);

  if (!activeCampaign) {
  return (
    <div className="empty-state">
      Откройте кампанию для управления плагинами.
    </div>
  );
  }

  const handleInstallPlugin = async () => {
    try {
      const selected = await open({
        multiple: false,
        filters: [
          {
            name: 'Плагин DndStudio',
            extensions: ['dndplugin'],
          },
        ],
      });

      if (typeof selected === 'string') {
        installPlugin.mutate(selected);
      }
    } catch (error) {
      console.error('Failed to install plugin', error);
    }
  };

  const handleInstallBuiltin = (pluginName: string) => {
    installBuiltinPlugin.mutate(pluginName);
  };

  const handleToggleActive = (pluginId: string, isActive: boolean) => {
    setPluginActive.mutate(
      { pluginId, isActive },
      {
        onError: (error: Error) => {
          alert(
            `Не удалось ${isActive ? 'активировать' : 'деактивировать'} плагин:\n${error.message}`,
          );
        },
      },
    );
  };

  const handleValidateDeps = (pluginId: string) => {
    validateDeps.mutate(pluginId, {
      onSuccess: (result) => {
        setDepCheckResult({ pluginId, result });
      },
    });
  };

  const handleUninstall = (pluginId: string, pluginName: string) => {
    // Проверяем зависимости перед удалением
    const dependents = plugins.filter((p) => {
      const manifest = parsePluginManifest(p.manifestJson);
      return manifest?.dependencies?.some((d) => d.id === pluginId);
    });

    if (dependents.length > 0) {
      const depNames = dependents
        .map((d) => {
          const m = parsePluginManifest(d.manifestJson);
          return m?.name ?? d.pluginId;
        })
        .join(', ');

      alert(
        `Cannot uninstall "${pluginName}".\nDependent plugins: ${depNames}`,
      );
      return;
    }

    if (
      window.confirm(
        `Удалить плагин "${pluginName}"? Его компендиумы будут удалены.`,
      )
    ) {
      uninstallPlugin.mutate(pluginId);
    }
  };

  const hasSrdPlugin = plugins.some((p) => p.pluginId === 'srd-monsters');

  return (
    <div className="navigator">
      {/* Built-in plugins */}
      <div className="navigator-section">
        <div className="navigator-section-title">Встроенные плагины</div>

        <div className="builtin-plugin-card">
          <div className="builtin-plugin-info">
            <div className="builtin-plugin-name">SRD Монстры</div>
            <div className="builtin-plugin-description">
              Базовый набор монстров из SRD (8 монстров)
            </div>
          </div>

          {hasSrdPlugin ? (
            <span className="builtin-plugin-installed">✓ Установлен</span>
          ) : (
            <button
              type="button"
              onClick={() => handleInstallBuiltin('srd-monsters')}
              disabled={installBuiltinPlugin.isPending}
            >
              {installBuiltinPlugin.isPending ? 'Установка…' : 'Установить'}
            </button>
          )}
        </div>
      </div>

      {/* Installed plugins */}
      <div className="navigator-section">
        <div className="navigator-section-title">Установленные плагины</div>

        <button
          type="button"
          onClick={handleInstallPlugin}
          disabled={installPlugin.isPending}
        >
          {installPlugin.isPending ? 'Установка…' : 'Установить .dndplugin'}
        </button>

        {isLoading && <div className="empty-state">Загрузка плагинов…</div>}

        {!isLoading && plugins.length === 0 && (
          <div className="empty-state">Плагины не установлены.</div>
        )}

        <div className="plugin-list">
          {plugins.map((plugin) => {
            const manifest = parsePluginManifest(plugin.manifestJson);
            const deps = manifest?.dependencies ?? [];

            return (
              <div key={plugin.pluginId} className="plugin-item">
                <label className="plugin-active-label">
                  <input
                    type="checkbox"
                    checked={plugin.isActive}
                    disabled={setPluginActive.isPending}
                    onChange={(event) =>
                      handleToggleActive(plugin.pluginId, event.target.checked)
                    }
                  />

                  <div className="plugin-info">
                    <div className="plugin-name">
                      {manifest?.name ?? plugin.pluginId}
                    </div>

                    <div className="plugin-meta">
                      v{plugin.version}
                      {manifest?.author ? ` · ${manifest.author}` : ''}
                    </div>

                    {manifest?.description && (
                      <div className="plugin-description">
                        {manifest.description}
                      </div>
                    )}

                    {/* Зависимости */}
                    {deps.length > 0 && (
                      <div className="plugin-deps">
                        <span className="plugin-deps-label">Deps:</span>
                        {deps.map((dep) => {
                          const depInstalled = plugins.some(
                            (p) => p.pluginId === dep.id,
                          );
                          const depActive = plugins.some(
                            (p) => p.pluginId === dep.id && p.isActive,
                          );

                          return (
                            <span
                              key={dep.id}
                              className={
                                depActive
                                  ? 'plugin-dep-ok'
                                  : depInstalled
                                    ? 'plugin-dep-inactive'
                                    : 'plugin-dep-missing'
                              }
                              title={`${dep.id} ${dep.version}`}
                            >
                              {dep.id}
                            </span>
                          );
                        })}
                      </div>
                    )}

                    {/* Предупреждение о совместимости */}
                    {plugin.compatWarning && (
                      <div className="plugin-warning">
                        ⚠️ {plugin.compatWarning}
                      </div>
                    )}

                    {/* Результат проверки зависимостей */}
                    {depCheckResult?.pluginId === plugin.pluginId && (
                      <div className="plugin-dep-check">
                        {depCheckResult.result.allSatisfied ? (
                          <span className="plugin-dep-ok">
                            ✓ Все зависимости выполнены
                          </span>
                        ) : (
                          <div>
                            {depCheckResult.result.missing.length > 0 && (
                              <div className="plugin-dep-missing">
                                Отсутствуют: {depCheckResult.result.missing.join(', ')}
                              </div>
                            )}
                            {depCheckResult.result.inactive.length > 0 && (
                              <div className="plugin-dep-inactive">
                                Неактивны: {depCheckResult.result.inactive.join(', ')}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </label>

                <div className="plugin-actions">
                    <button
                      type="button"
                      className="icon-btn"
                      title="Проверить зависимости"
                      onClick={() => handleValidateDeps(plugin.pluginId)}
                      disabled={validateDeps.isPending}
                    >
                      🔍
                    </button>

                    <button
                      type="button"
                      className="icon-btn icon-btn-danger"
                      title="Удалить плагин"
                      disabled={uninstallPlugin.isPending}
                      onClick={() =>
                        handleUninstall(
                          plugin.pluginId,
                          manifest?.name ?? plugin.pluginId,
                        )
                      }
                    >
                      🗑️
                    </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ========================================= */
/* Панель Компендиев                         */
/* ========================================= */
function CompendiumsPanel() {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [isCreateCompendiumOpen, setIsCreateCompendiumOpen] = useState(false);

  const { data: activeCampaign } = useActiveCampaign();
  const { data: compendiums = [], isLoading } = useCompendiums(
    Boolean(activeCampaign),
  );

  const updateCompendium = useUpdateCompendium();
  const deleteCompendium = useDeleteCompendium();
  const openCompendiumTab = useWorkspaceStore(
    (state) => state.openCompendiumTab,
  );

  if (!activeCampaign) {
  return (
    <div className="empty-state">
      Откройте кампанию, чтобы увидеть компендиумы.
    </div>
  );
  }

  const startEditing = (id: string, currentName: string) => {
    setEditingId(id);
    setEditName(currentName);
  };

  const saveEditing = () => {
    if (!editingId) return;

    const name = editName.trim();
    if (!name) return;

    const compendium = compendiums.find((c) => c.id === editingId);
    if (!compendium) return;

    updateCompendium.mutate(
      {
        id: editingId,
        name,
        compendiumType: compendium.type,
      },
      {
        onSuccess: () => {
          setEditingId(null);
          setEditName('');
        },
      },
    );
  };

  const handleDelete = (id: string, name: string) => {
    if (!window.confirm(`Удалить компендиум "${name}" и все его записи?`)) {
      return;
    }

    deleteCompendium.mutate({ id });
  };

  return (
    <div className="navigator">
        <div className="navigator-section">
          <div className="navigator-section-header">
            <span className="navigator-section-title">Compendiums</span>
            <button
              type="button"
              className="icon-btn"
              title="Create new compendium"
              onClick={() => setIsCreateCompendiumOpen(true)}
            >
              ＋
            </button>
          </div>

          {isLoading && (
            <div className="empty-state">Загрузка компендиумов…</div>
          )}

          {!isLoading && compendiums.length === 0 && (
            <div className="empty-state">Компендиумов пока нет.</div>
          )}

        <ul className="navigator-list">
          {compendiums.map((compendium) => {
            const isEditing = editingId === compendium.id;
            const isFromPlugin = Boolean(compendium.sourcePluginId);

            return (
              <li key={compendium.id}>
                {isEditing ? (
                  <div className="navigator-item-edit">
                    <input
                      value={editName}
                      onChange={(event) => setEditName(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') saveEditing();
                        if (event.key === 'Escape') setEditingId(null);
                      }}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={saveEditing}
                      disabled={updateCompendium.isPending}
                    >
                      ✓
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="navigator-item-row">
                    <button
                      type="button"
                      className="navigator-item navigator-item-grow"
                      onClick={() => openCompendiumTab(compendium)}
                    >
                      <span>{compendium.name}</span>
                      <small>
                        {compendium.type}
                        {isFromPlugin && ' 🔌'}
                      </small>
                    </button>

                    {!isFromPlugin && (
                      <div className="navigator-item-actions">
                    <button
                      type="button"
                      className="icon-btn"
                      title="Переименовать"
                      onClick={() =>
                        startEditing(compendium.id, compendium.name)
                      }
                    >
                      ✏️
                    </button>
                    <button
                      type="button"
                      className="icon-btn icon-btn-danger"
                      title="Удалить"
                      onClick={() =>
                        handleDelete(compendium.id, compendium.name)
                      }
                    >
                      🗑️
                    </button>
                      </div>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      <CreateCompendiumModal
        open={isCreateCompendiumOpen}
        onClose={() => setIsCreateCompendiumOpen(false)}
      />
    </div>
  );
}

/* ========================================= */
/* Панель Навигатора (дерево кампании)       */
/* ========================================= */

function NavigatorPanel() {
  return <CampaignTree />;
}

/* ========================================= */
/* Левая панель (контейнер вкладок)          */
/* ========================================= */

/* ========================================= */
/* Левая панель (контейнер вкладок)          */
/* ========================================= */

export function LeftPanel() {
  const activeLeftTab = useUiStore((state) => state.activeLeftTab);

  return (
    <aside className="panel left-panel" aria-label="Left panel content">
      <div className="panel-content">
        {activeLeftTab === 'navigator' && <NavigatorPanel />}

        {activeLeftTab === 'plugins' && <PluginsPanel />}

        {activeLeftTab === 'compendiums' && <CompendiumsPanel />}
      </div>
    </aside>
  );
}