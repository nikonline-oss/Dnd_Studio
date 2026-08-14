import { FormEvent, useState } from 'react';
import { open } from '@tauri-apps/plugin-dialog';
import {
  useActiveCampaign,
  useCharacters,
  useCompendiums,
  useCreateCharacter,
  useCreateCompendium,
  useCreateMap,
  useDeleteCompendium,
  useInstalledPlugins,
  useInstallPlugin,
  useMaps,
  useSetPluginActive,
  useUninstallPlugin,
  useUpdateCompendium,
} from '../api/hooks';
import { useUiStore } from '../stores/ui';
import { useWorkspaceStore } from '../stores/workspace';



function parsePluginManifest(rawJson: string): {
  name?: string;
  description?: string;
  author?: string;
} | null {
  try {
    return JSON.parse(rawJson);
  } catch {
    return null;
  }
}

function PluginsPanel() {
  const { data: activeCampaign } = useActiveCampaign();
  const uninstallPlugin = useUninstallPlugin();

  const { data: plugins = [], isLoading } = useInstalledPlugins(
    Boolean(activeCampaign),
  );

  const installPlugin = useInstallPlugin();
  const setPluginActive = useSetPluginActive();

  if (!activeCampaign) {
    return (
      <div className="empty-state">
        Open a campaign to manage plugins.
      </div>
    );
  }

  const handleInstallPlugin = async () => {
    try {
      const selected = await open({
        multiple: false,
        filters: [
          {
            name: 'DndStudio Plugin',
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

  return (
    <div className="navigator">
      <div className="navigator-section">
        <div className="navigator-section-title">Plugins</div>

        <button
          type="button"
          onClick={handleInstallPlugin}
          disabled={installPlugin.isPending}
        >
          {installPlugin.isPending ? 'Installing…' : 'Install .dndplugin'}
        </button>

        {isLoading && <div className="empty-state">Loading plugins…</div>}

        {!isLoading && plugins.length === 0 && (
          <div className="empty-state">No plugins installed.</div>
        )}

        <div className="plugin-list">
          {plugins.map((plugin) => {
            const manifest = parsePluginManifest(plugin.manifestJson);

            return (
              <div key={plugin.pluginId} className="plugin-item">
                <label className="plugin-active-label">
                  <input
                    type="checkbox"
                    checked={plugin.isActive}
                    disabled={setPluginActive.isPending}
                    onChange={(event) =>
                      setPluginActive.mutate({
                        pluginId: plugin.pluginId,
                        isActive: event.target.checked,
                      })
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
                  </div>
                </label>

                <div className="plugin-actions">
                  <button
                    type="button"
                    className="icon-btn icon-btn-danger"
                    title="Uninstall plugin"
                    disabled={uninstallPlugin.isPending}
                    onClick={() => {
                      const name = manifest?.name ?? plugin.pluginId;
                      if (window.confirm(`Uninstall plugin "${name}"? Its compendiums will be removed.`)) {
                        uninstallPlugin.mutate(plugin.pluginId);
                      }
                    }}
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
  const [newCompendiumName, setNewCompendiumName] = useState('');
  const [newCompendiumType, setNewCompendiumType] = useState('monster');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const { data: activeCampaign } = useActiveCampaign();
  const { data: compendiums = [], isLoading } = useCompendiums(
    Boolean(activeCampaign),
  );

  const createCompendium = useCreateCompendium();
  const updateCompendium = useUpdateCompendium();
  const deleteCompendium = useDeleteCompendium();
  const openCompendiumTab = useWorkspaceStore(
    (state) => state.openCompendiumTab,
  );

  if (!activeCampaign) {
    return (
      <div className="empty-state">
        Open a campaign to see compendiums.
      </div>
    );
  }

  const onCreateCompendium = (event: FormEvent) => {
    event.preventDefault();

    const name = newCompendiumName.trim();

    if (!name) {
      return;
    }

    createCompendium.mutate(
      {
        name,
        compendiumType: newCompendiumType,
      },
      {
        onSuccess: () => {
          setNewCompendiumName('');
        },
      },
    );
  };

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
    if (!window.confirm(`Delete compendium "${name}" and all its entries?`)) {
      return;
    }

    deleteCompendium.mutate({ id });
  };

  return (
    <div className="navigator">
      <div className="navigator-section">
        <div className="navigator-section-title">Compendiums</div>

        <form className="navigator-form" onSubmit={onCreateCompendium}>
          <input
            value={newCompendiumName}
            onChange={(event) => setNewCompendiumName(event.target.value)}
            placeholder="New compendium"
          />

          <select
            value={newCompendiumType}
            onChange={(event) => setNewCompendiumType(event.target.value)}
            title="Compendium type"
          >
            <option value="monster">Monster</option>
            <option value="spell">Spell</option>
            <option value="item">Item</option>
            <option value="feat">Feat</option>
          </select>

          <button
            type="submit"
            disabled={!newCompendiumName.trim() || createCompendium.isPending}
          >
            {createCompendium.isPending ? '…' : 'Add'}
          </button>
        </form>

        {isLoading && (
          <div className="empty-state">Loading compendiums…</div>
        )}

        {!isLoading && compendiums.length === 0 && (
          <div className="empty-state">No compendiums yet.</div>
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
                          title="Rename"
                          onClick={() =>
                            startEditing(compendium.id, compendium.name)
                          }
                        >
                          ✏️
                        </button>
                        <button
                          type="button"
                          className="icon-btn icon-btn-danger"
                          title="Delete"
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
    </div>
  );
}

/* ========================================= */
/* Панель Навигатора (Карты и Персонажи)     */
/* ========================================= */

function NavigatorPanel() {
  const [newMapName, setNewMapName] = useState('');
  const [newCharacterName, setNewCharacterName] = useState('');
  const [newCharacterType, setNewCharacterType] = useState<
    'pc' | 'npc' | 'monster'
  >('pc');

  const { data: activeCampaign } = useActiveCampaign();

  const { data: maps = [], isLoading: areMapsLoading } = useMaps(
    Boolean(activeCampaign),
  );

  const { data: characters = [], isLoading: areCharactersLoading } =
    useCharacters(Boolean(activeCampaign));

  const createMap = useCreateMap();
  const createCharacter = useCreateCharacter();

  const openMapTab = useWorkspaceStore((state) => state.openMapTab);
  const openCharacterTab = useWorkspaceStore(
    (state) => state.openCharacterTab,
  );

  if (!activeCampaign) {
    return (
      <div className="empty-state">
        Open a campaign to see its navigator.
      </div>
    );
  }

  const onCreateMap = (event: FormEvent) => {
    event.preventDefault();

    const name = newMapName.trim();

    if (!name) {
      return;
    }

    createMap.mutate(
      {
        name,
        width: 2000,
        height: 1500,
        grid_size: 50,
      },
      {
        onSuccess: () => {
          setNewMapName('');
        },
      },
    );
  };

  const onCreateCharacter = (event: FormEvent) => {
    event.preventDefault();

    const name = newCharacterName.trim();

    if (!name) {
      return;
    }

    createCharacter.mutate(
      {
        name,
        characterType: newCharacterType,
      },
      {
        onSuccess: () => {
          setNewCharacterName('');
        },
      },
    );
  };

  return (
    <div className="navigator">
      {/* Секция Персонажей */}
      <div className="navigator-section">
        <div className="navigator-section-title">Characters</div>

        <form className="navigator-form" onSubmit={onCreateCharacter}>
          <input
            value={newCharacterName}
            onChange={(event) => setNewCharacterName(event.target.value)}
            placeholder="Character name"
          />

          <select
            value={newCharacterType}
            onChange={(event) =>
              setNewCharacterType(
                event.target.value as 'pc' | 'npc' | 'monster',
              )
            }
          >
            <option value="pc">PC</option>
            <option value="npc">NPC</option>
            <option value="monster">Monster</option>
          </select>

          <button
            type="submit"
            disabled={!newCharacterName.trim() || createCharacter.isPending}
          >
            {createCharacter.isPending ? '…' : 'Add'}
          </button>
        </form>

        {areCharactersLoading && (
          <div className="empty-state">Loading characters…</div>
        )}

        {!areCharactersLoading && characters.length === 0 && (
          <div className="empty-state">No characters yet.</div>
        )}

        <ul className="navigator-list">
          {characters.map((character) => (
            <li key={character.id}>
              <button
                type="button"
                className="navigator-item"
                onClick={() => openCharacterTab(character)}
              >
                <span>{character.name}</span>
                <small>{character.type.toUpperCase()}</small>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Секция Карт */}
      <div className="navigator-section">
        <div className="navigator-section-title">Maps</div>

        <form className="navigator-form" onSubmit={onCreateMap}>
          <input
            value={newMapName}
            onChange={(event) => setNewMapName(event.target.value)}
            placeholder="New map name"
          />

          <button
            type="submit"
            disabled={!newMapName.trim() || createMap.isPending}
          >
            {createMap.isPending ? '…' : 'Add'}
          </button>
        </form>

        {areMapsLoading && (
          <div className="empty-state">Loading maps…</div>
        )}

        {!areMapsLoading && maps.length === 0 && (
          <div className="empty-state">No maps yet.</div>
        )}

        <ul className="navigator-list">
          {maps.map((map) => (
            <li key={map.id}>
              <button
                type="button"
                className="navigator-item"
                onClick={() => openMapTab(map)}
              >
                <span>{map.name}</span>
                <small>
                  {map.width}×{map.height}
                </small>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

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