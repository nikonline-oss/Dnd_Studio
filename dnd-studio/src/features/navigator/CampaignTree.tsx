import { useMemo, useState, useEffect } from 'react';

import {
  useActiveCampaign,
  useAllTokens,
  useCharacters,
  useCreateCharacter,
  useCreateMap,
  useCreateToken,
  useDeleteCharacter,
  useDeleteMap,
  useDeleteToken,
  useMaps,
} from '../../shared/api/hooks';
import { useTableStore } from '../../shared/stores/table';
import { useWorkspaceStore } from '../../shared/stores/workspace';
import { useDragStore } from '../../shared/stores/drag';
import { ConfirmDialog } from '../../shared/ui/ConfirmDialog';

import type { MapSummary, TokenSummary, CharacterSummary } from '../../shared/api/bindings';

import { useDraggable } from '../../shared/hooks/useDraggable';
import { useDropTarget } from '../../shared/hooks/useDropTarget';

type TreeTab = 'maps' | 'characters';

type AddAction = 'add-map' | 'add-character-pc' | 'add-character-npc' | 'add-character-monster' | 'add-token';

interface PendingDelete {
  kind: 'map' | 'token' | 'character';
  id: string;
  name: string;
  mapId?: string;
}

interface PendingAdd {
  kind: AddAction;
  mapId?: string;
}

const CHARACTER_TYPE_ICONS: Record<string, string> = {
  pc: '🧙',
  npc: '🧑‍🌾',
  monster: '👹',
};

export function CampaignTree() {
  const { data: activeCampaign } = useActiveCampaign();
  const { data: maps = [] } = useMaps(Boolean(activeCampaign));
  const { data: allTokens = [] } = useAllTokens(Boolean(activeCampaign));
  const { data: characters = [] } = useCharacters(Boolean(activeCampaign));

  const deleteMap = useDeleteMap();
  const deleteToken = useDeleteToken();
  const deleteCharacter = useDeleteCharacter();
  const createToken = useCreateToken();
  const createMap = useCreateMap();
  const createCharacter = useCreateCharacter();

  const openTab = useWorkspaceStore((state) => state.openTab);
  const setSelectedTokenId = useTableStore((state) => state.setSelectedTokenId);
  const selectedTokenId = useTableStore((state) => state.selectedTokenId);

  const [activeTab, setActiveTab] = useState<TreeTab>('maps');
  
  // Получаем функции и состояние из drag store
  const dragging = useDragStore((s) => s.dragging);
  const setPreviousTab = useDragStore((s) => s.setPreviousTab);
  const clearPreviousTab = useDragStore((s) => s.clearPreviousTab);

  // Эффект для автопереключения вкладок при перетаскивании
  useEffect(() => {
    if (dragging) {
      // Начинается перетаскивание: запоминаем текущую вкладку и переключаемся на карты
      setPreviousTab(activeTab);
      setActiveTab('maps');
    } else {
      // Перетаскивание закончилось: восстанавливаем предыдущую вкладку
      const prevTab = useDragStore.getState().previousTab;
      if (prevTab) {
        setActiveTab(prevTab as TreeTab);
        clearPreviousTab();
      }
    }
  }, [dragging, activeTab, setPreviousTab, clearPreviousTab]);

  const [expandedMapIds, setExpandedMapIds] = useState<Set<string>>(new Set());
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
  const [pendingAdd, setPendingAdd] = useState<PendingAdd | null>(null);
  const [newName, setNewName] = useState('');

  // Группируем токены по map_id
  const tokensByMapId = useMemo(() => {
    const grouped = new Map<string, TokenSummary[]>();

    for (const token of allTokens) {
      const list = grouped.get(token.mapId) ?? [];
      list.push(token);
      grouped.set(token.mapId, list);
    }

    return grouped;
  }, [allTokens]);

  const handleToggleMap = (mapId: string) => {
    setExpandedMapIds((prev) => {
      const next = new Set(prev);
      if (next.has(mapId)) {
        next.delete(mapId);
      } else {
        next.add(mapId);
      }
      return next;
    });
  };

  const handleOpenMap = (map: MapSummary) => {
    openTab({
      id: `map:${map.id}`,
      kind: 'map',
      title: map.name,
      entityId: map.id,
    });
  };

  const handleSelectToken = (token: TokenSummary) => {
    // Открываем карту токена если не открыта
    const map = maps.find((m) => m.id === token.mapId);
    if (map) {
      handleOpenMap(map);
    }

    // Выделяем токен
    setSelectedTokenId(token.id);
  };

  const handleAddTokenToMap = (map: MapSummary) => {
    const jitterX = (Math.random() - 0.5) * map.gridSize * 2;
    const jitterY = (Math.random() - 0.5) * map.gridSize * 2;

    createToken.mutate({
      mapId: map.id,
      x: map.width / 2 + jitterX,
      y: map.height / 2 + jitterY,
      characterId: null,
    });
  };

  const handleConfirmDelete = () => {
    if (!pendingDelete) return;

    switch (pendingDelete.kind) {
      case 'map':
        deleteMap.mutate(pendingDelete.id);
        break;

      case 'token':
        if (pendingDelete.mapId) {
          deleteToken.mutate({
            mapId: pendingDelete.mapId,
            tokenId: pendingDelete.id,
          });
        }
        break;

      case 'character':
        deleteCharacter.mutate(pendingDelete.id);
        break;
    }

    setPendingDelete(null);
  };

  const handleAdd = () => {
    if (!pendingAdd || !newName.trim()) return;
    const name = newName.trim();

    switch (pendingAdd.kind) {
      case 'add-map':
        createMap.mutate({
          name,
          width: 2000,
          height: 1500,
          grid_size: 50,
        });
        break;

      case 'add-character-pc':
      case 'add-character-npc':
      case 'add-character-monster':
        createCharacter.mutate({
          name,
          characterType: pendingAdd.kind.replace('add-character-', '') as 'pc' | 'npc' | 'monster',
        });
        break;

      case 'add-token':
        if (pendingAdd.mapId) {
          const map = maps.find((m) => m.id === pendingAdd.mapId);
          if (map) {
            const jitterX = (Math.random() - 0.5) * map.gridSize * 2;
            const jitterY = (Math.random() - 0.5) * map.gridSize * 2;
            createToken.mutate({
              mapId: map.id,
              x: map.width / 2 + jitterX,
              y: map.height / 2 + jitterY,
              characterId: null,
            });
          }
        }
        break;
    }

    setPendingAdd(null);
    setNewName('');
  };

  const openAddDialog = (kind: AddAction, mapId?: string) => {
    setPendingAdd({ kind, mapId });
    setNewName('');
  };

  if (!activeCampaign) {
    return (
      <div className="empty-state">
        Open a campaign to see its contents.
      </div>
    );
  }

  return (
    <div className="campaign-tree">
      {/* Вкладки */}
      <div className="campaign-tree-tabs">
        <button
          type="button"
          className={activeTab === 'maps' ? 'active' : ''}
          onClick={() => setActiveTab('maps')}
        >
          Maps
        </button>
        <button
          type="button"
          className={activeTab === 'characters' ? 'active' : ''}
          onClick={() => setActiveTab('characters')}
        >
          Characters
        </button>

        {/* Кнопка добавления */}
        <div className="campaign-tree-add">
          <button
            type="button"
            className="icon-btn icon-btn-add"
            title="Add"
            onClick={() => {
              if (activeTab === 'maps') {
                openAddDialog('add-map');
              } else {
                openAddDialog('add-character-pc');
              }
            }}
          >
            +
          </button>
        </div>
      </div>

      {/* Контент */}
      <div className="campaign-tree-content">
        {activeTab === 'maps' && (
          <MapsTree
            maps={maps}
            tokensByMapId={tokensByMapId}
            expandedMapIds={expandedMapIds}
            selectedTokenId={selectedTokenId}
            onToggleMap={handleToggleMap}
            onOpenMap={handleOpenMap}
            onSelectToken={handleSelectToken}
            onAddToken={handleAddTokenToMap}
            onAddMap={() => openAddDialog('add-map')}
            onDeleteMap={(map) =>
              setPendingDelete({ kind: 'map', id: map.id, name: map.name })
            }
            onDeleteToken={(token) =>
              setPendingDelete({
                kind: 'token',
                id: token.id,
                name: token.characterName ?? 'Token',
                mapId: token.mapId,
              })
            }
            onCreateToken={(mapId, x, y, characterId) => {
              createToken.mutate({ mapId, x, y, characterId });
            }}
          />
        )}

        {activeTab === 'characters' && (
          <CharactersList
            characters={characters}
            onAddCharacter={(type) => openAddDialog(`add-character-${type}` as AddAction)}
            onDeleteCharacter={(character) =>
              setPendingDelete({
                kind: 'character',
                id: character.id,
                name: character.name,
              })
            }
          />
        )}
      </div>

      {/* Диалог подтверждения удаления */}
      <ConfirmDialog
        open={pendingDelete !== null}
        title={`Delete ${pendingDelete?.kind ?? ''}`}
        message={getDeleteMessage(pendingDelete)}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        destructive
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDelete(null)}
      />

      {/* Диалог добавления */}
      {pendingAdd && (
        <div className="confirm-dialog-overlay" onClick={() => setPendingAdd(null)}>
          <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-dialog-header">
              <h3>{getAddTitle(pendingAdd)}</h3>
            </div>
            <div className="confirm-dialog-body">
              <input
                className="add-dialog-input"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Name"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAdd();
                  if (e.key === 'Escape') setPendingAdd(null);
                }}
              />
            </div>
            <div className="confirm-dialog-footer">
              <button className="btn-secondary" onClick={() => setPendingAdd(null)}>
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handleAdd}
                disabled={!newName.trim()}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** Формирует заголовок для диалога добавления */
function getAddTitle(add: PendingAdd | null): string {
  if (!add) return '';
  switch (add.kind) {
    case 'add-map':
      return 'New map';
    case 'add-character-pc':
      return 'New PC';
    case 'add-character-npc':
      return 'New NPC';
    case 'add-character-monster':
      return 'New monster';
    case 'add-token':
      return 'New token';
    default:
      return '';
  }
}

/** Формирует сообщение для диалога удаления */
function getDeleteMessage(pending: PendingDelete | null): string {
  if (!pending) return '';

  switch (pending.kind) {
    case 'map':
      return `Delete map "${pending.name}"? All tokens on this map will be permanently deleted.`;
    case 'token':
      return `Delete token "${pending.name}"? This action cannot be undone.`;
    case 'character':
      return `Delete character "${pending.name}"? Tokens linked to this character will remain but lose their link.`;
    default:
      return '';
  }
}

// ============================================
// Дерево карт
// ============================================

interface MapsTreeProps {
  maps: MapSummary[];
  tokensByMapId: Map<string, TokenSummary[]>;
  expandedMapIds: Set<string>;
  selectedTokenId: string | null;
  onToggleMap: (mapId: string) => void;
  onOpenMap: (map: MapSummary) => void;
  onSelectToken: (token: TokenSummary) => void;
  onAddToken: (map: MapSummary) => void;
  onAddMap: () => void;
  onDeleteMap: (map: MapSummary) => void;
  onDeleteToken: (token: TokenSummary) => void;
  onCreateToken: (mapId: string, x: number, y: number, characterId: string) => void;
}

function MapsTree({
  maps,
  tokensByMapId,
  expandedMapIds,
  selectedTokenId,
  onToggleMap,
  onOpenMap,
  onSelectToken,
  onAddToken,
  onAddMap,
  onDeleteMap,
  onDeleteToken,
  onCreateToken,
}: MapsTreeProps) {
  if (maps.length === 0) {
    return (
      <div className="empty-state">
        No maps yet.
        <button
          type="button"
          className="btn-primary"
          onClick={onAddMap}
        >
          + New map
        </button>
      </div>
    );
  }

  return (
    <div className="tree">
      {/* Кнопка "New map" */}
      <div className="tree-node-header">
        <div className="tree-node-label" style={{ opacity: 0.4, cursor: 'default' }}>
          <span className="tree-node-icon">📋</span>
          <span className="tree-node-name">Maps</span>
        </div>

        <div className="tree-node-actions">
          <button
            type="button"
            className="icon-btn"
            title="Add map"
            onClick={onAddMap}
          >
            ＋
          </button>
        </div>
      </div>

      {maps.map((map) => {
        const tokens = tokensByMapId.get(map.id) ?? [];
        const isExpanded = expandedMapIds.has(map.id);

        return (
          <MapRow
            key={map.id}
            map={map}
            tokens={tokens}
            isExpanded={isExpanded}
            selectedTokenId={selectedTokenId}
            onToggle={() => onToggleMap(map.id)}
            onOpen={() => onOpenMap(map)}
            onSelectToken={onSelectToken}
            onAddToken={() => onAddToken(map)}
            onDropCharacter={(characterId) => {
              onCreateToken(map.id, map.width / 2, map.height / 2, characterId);
            }}
            onDeleteMap={() => onDeleteMap(map)}
            onDeleteToken={onDeleteToken}
          />
        );
      })}
    </div>
  );
}

function MapRow({
  map,
  tokens,
  isExpanded,
  selectedTokenId,
  onToggle,
  onOpen,
  onSelectToken,
  onAddToken,
  onDropCharacter,
  onDeleteMap,
  onDeleteToken,
}: {
  map: MapSummary;
  tokens: TokenSummary[];
  isExpanded: boolean;
  selectedTokenId: string | null;
  onToggle: () => void;
  onOpen: () => void;
  onSelectToken: (token: TokenSummary) => void;
  onAddToken: () => void;
  onDropCharacter: (characterId: string) => void;
  onDeleteMap: () => void;
  onDeleteToken: (token: TokenSummary) => void;
}) {
  const { ref, isOver, isAccepting } = useDropTarget({
    target: { kind: 'map', id: map.id },
    accepts: (item) => item.kind === 'character',
    onDrop: (item) => {
      if (item.kind === 'character') {
        onDropCharacter(item.id);
      }
    },
  });

  return (
    <div className="tree-node">
      <div
        ref={ref}
        className={`tree-node-header ${isOver && isAccepting ? 'drop-target' : ''}`}
      >
        <button
          type="button"
          className="tree-node-toggle"
          onClick={onToggle}
          title={isExpanded ? 'Collapse' : 'Expand'}
        >
          {isExpanded ? '▼' : '▶'}
        </button>

        <button
          type="button"
          className="tree-node-label"
          onClick={onOpen}
          title="Open map"
        >
          <span className="tree-node-icon">🗺️</span>
          <span className="tree-node-name">{map.name}</span>
          <span className="tree-node-badge">{tokens.length}</span>
        </button>

        <div className="tree-node-actions">
          <button
            type="button"
            className="icon-btn"
            title="Add token"
            onClick={onAddToken}
          >
            ＋
          </button>
          <button
            type="button"
            className="icon-btn icon-btn-danger"
            title="Delete map"
            onClick={onDeleteMap}
          >
            🗑️
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="tree-children">
          {tokens.length === 0 ? (
            <div className="tree-empty">No tokens</div>
          ) : (
            tokens.map((token, index) => (
              <div
                key={token.id}
                className={`tree-node-header tree-token ${
                  token.id === selectedTokenId ? 'selected' : ''
                }`}
              >
                <button
                  type="button"
                  className="tree-node-label tree-token-label"
                  onClick={() => onSelectToken(token)}
                  title="Select token on map"
                >
                  <span className="tree-node-icon">
                    {token.characterName ? '👤' : '⬤'}
                  </span>
                  <span className="tree-node-name">
                    {token.characterName ?? `Token ${index + 1}`}
                  </span>
                  {!token.isVisible && (
                    <span
                      className="tree-token-hidden"
                      title="Hidden from players"
                    >
                      🚫
                    </span>
                  )}
                </button>

                <div className="tree-node-actions">
                  <button
                    type="button"
                    className="icon-btn icon-btn-danger"
                    title="Delete token"
                    onClick={() => onDeleteToken(token)}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ============================================
// Список персонажей
// ============================================

interface CharactersListProps {
  characters: CharacterSummary[];
  onAddCharacter: (type: 'pc' | 'npc' | 'monster') => void;
  onDeleteCharacter: (character: CharacterSummary) => void;
}

function CharacterRow({
  character,
  type,
  onDeleteCharacter,
}: {
  character: CharacterSummary;
  type: string;
  onDeleteCharacter: (character: CharacterSummary) => void;
}) {
  const { handlers, isDragging } = useDraggable({
    item: {
      kind: 'character',
      id: character.id,
      name: character.name,
      icon: CHARACTER_TYPE_ICONS[type] ?? '👤',
    },
  });

  return (
    <div
      className={`tree-node ${isDragging ? 'is-dragging' : ''}`}
      {...handlers}
    >
      <div className="tree-node-header tree-character-draggable">
        <button type="button" className="tree-node-label">
          <span className="tree-node-icon">
            {CHARACTER_TYPE_ICONS[type] ?? '❓'}
          </span>
          <span className="tree-node-name">{character.name}</span>
          <span className="tree-node-status">{character.status}</span>
        </button>

        <div className="tree-node-actions">
          <button
            type="button"
            className="icon-btn icon-btn-danger"
            title="Delete character"
            onClick={() => onDeleteCharacter(character)}
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}

function CharactersList({ characters, onAddCharacter, onDeleteCharacter }: CharactersListProps) {
  if (characters.length === 0) {
    return (
      <div className="empty-state">
        No characters yet.
        <div style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
          <button className="btn-primary" onClick={() => onAddCharacter('pc')}>+ PC</button>
          <button className="btn-secondary" onClick={() => onAddCharacter('npc')}>+ NPC</button>
          <button className="btn-secondary" onClick={() => onAddCharacter('monster')}>+ Monster</button>
        </div>
      </div>
    );
  }

  // Группируем по типу
  const grouped = useMemo(() => {
    const groups = new Map<string, CharacterSummary[]>();

    for (const character of characters) {
      const list = groups.get(character.type) ?? [];
      list.push(character);
      groups.set(character.type, list);
    }

    return groups;
  }, [characters]);

  const typeOrder = ['pc', 'npc', 'monster'];
  const typeLabels: Record<string, string> = {
    pc: 'Player Characters',
    npc: 'NPCs',
    monster: 'Monsters',
  };

  return (
    <div className="tree">
      {/* Заголовок с кнопкой добавления */}
      <div className="tree-node-header">
        <div className="tree-node-label" style={{ opacity: 0.4, cursor: 'default' }}>
          <span className="tree-node-icon">👥</span>
          <span className="tree-node-name">Characters</span>
        </div>

        <div className="tree-node-actions">
          <button
            type="button"
            className="icon-btn"
            title="Add character"
            onClick={() => onAddCharacter('pc')}
          >
            ＋
          </button>
        </div>
      </div>

      {typeOrder.map((type) => {
        const list = grouped.get(type) ?? [];
        if (list.length === 0) return null;

        return (
          <div key={type} className="tree-section">
            <div className="tree-section-title">{typeLabels[type]}</div>

            {list.map((character) => (
              <CharacterRow
                key={character.id}
                character={character}
                type={type}
                onDeleteCharacter={onDeleteCharacter}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}