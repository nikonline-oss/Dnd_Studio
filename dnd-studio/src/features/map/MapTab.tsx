import { useCallback, useEffect, useRef, useState } from 'react';
import { open } from '@tauri-apps/plugin-dialog';

import {
  useActiveScene,
  useCharacters,
  useCreateToken,
  useDeleteToken,
  useImportMapImage,
  useMap,
  useMoveToken,
  useSetActiveScene,
  useSetMapVisibleToPlayers,
  useTokens,
} from '../../shared/api/hooks';
import { useMapSettingsStore } from '../../shared/stores/mapSettings';
import { useTableStore } from '../../shared/stores/table';
import { relayClient } from '../../shared/services/relayClient';

import { MapCanvas } from './MapCanvas';
import { MapImageImportDialog } from './MapImageImportDialog';
import type { MapImageImportOptions } from '../../shared/api/hooks';
import { useUiStore } from '../../shared/stores/ui';
import { usePlayerVisibility } from '../../shared/hooks/usePlayerVisibility';


export function MapTab({ mapId }: { mapId?: string }) {
  const { data: map, isLoading } = useMap(mapId);
  const { data: tokens = [] } = useTokens(mapId);
  const { data: characters = [] } = useCharacters(Boolean(mapId));

  const createToken = useCreateToken();
  const moveToken = useMoveToken();
  const deleteToken = useDeleteToken();
  const importMapImage = useImportMapImage();
  const { canSeeToken } = usePlayerVisibility();

  const showGridByMap = useMapSettingsStore((state) => state.showGridByMap);
  const toggleGrid = useMapSettingsStore((state) => state.toggleGrid);


  const setSelectedMapId = useTableStore((state) => state.setSelectedMapId);
  const setSelectedTokenIdGlobal = useTableStore(
    (state) => state.setSelectedTokenId,
  );

  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);
  const [pendingDeleteTokenIds, setPendingDeleteTokenIds] = useState<string[]>([]);
  const [selectedCharacterId, setSelectedCharacterId] = useState<string>('');
  const [pendingImagePath, setPendingImagePath] = useState<string | null>(null);

  const globalSelectedTokenId = useTableStore((state) => state.selectedTokenId);
  const setGlobalSelectedTokenId = useTableStore((state) => state.setSelectedTokenId);
  // ВСЕ ХУКИ useEffect И useCallback ДОЛЖНЫ БЫТЬ ЗДЕСЬ, ДО УСЛОВНЫХ ВОЗВРАТОВ

  useEffect(() => {
    if (map) {
      setSelectedMapId(map.id);
    } else {
      setSelectedMapId(null);
    }

    return () => {
      setSelectedMapId(null);
      setSelectedTokenIdGlobal(null);
    };
  }, [map?.id, setSelectedMapId, setSelectedTokenIdGlobal]);

  useEffect(() => {
    if (globalSelectedTokenId && globalSelectedTokenId !== selectedTokenId) {
      setSelectedTokenId(globalSelectedTokenId);
    }
  }, [globalSelectedTokenId, selectedTokenId]);

  const { isGM, isLocalMode } = usePlayerVisibility();
  const setMapVisible = useSetMapVisibleToPlayers();
  const setActiveScene = useSetActiveScene();
  const { data: activeSceneId } = useActiveScene(Boolean(map));

  const isActiveScene = !map || !isGM ? false : activeSceneId === map.id;


  // GM: переключить видимость карты
  const handleToggleVisibility = () => {
    if (!map || !isGM) return;
    if (!isGM) return;

    const newVisibility = !map.isVisibleToPlayers;

    setMapVisible.mutate(
      { mapId: map.id, isVisible: newVisibility },
      {
        onSuccess: () => {
          // Уведомляем игроков через Relay
          if (relayClient.status === 'connected') {
            relayClient.send('state_update', {
              map_visibility: { [map.id]: newVisibility },
            });
          }
        },
      },
    );
  };

  // GM: сделать активной сценой
  const handleSetActiveScene = () => {
    if (!map || !isGM) return;
    if (!isGM) return;

    setActiveScene.mutate(map.id, {
      onSuccess: () => {
        // Уведомляем игроков через Relay
        if (relayClient.status === 'connected') {
          relayClient.send('state_update', {
            active_scene_map_id: map.id,
          });
        }
      },
    });
  };

  // Перемещение токена с отправкой в Relay
  const handleMoveToken = useCallback(
    async (tokenId: string, x: number, y: number) => {
      if (!map) return;

      try {
        await moveToken.mutateAsync({
          mapId: map.id,
          tokenId,
          x,
          y,
        });

        // Отправляем уведомление другим клиентам
        if (relayClient.status === 'connected') {
          relayClient.send('token_move', {
            token_id: tokenId,
            map_id: map.id,   // <-- map_id обязателен
            x,
            y,
            rotation: 0,
          });
        }
      } catch {
        // Rollback уже есть в useMoveToken
      }
    },
    [map, moveToken],
  );

  // Обновление тумана войны с отправкой в Relay
  const handleFogChange = useCallback(
    (newFogCells: Set<string>) => {
      if (!map) return;

      // Сохранение в БД будет через debounce в MapTab
      // Здесь только отправляем в Relay

      if (relayClient.status === 'connected') {
        const fogData = JSON.stringify(Array.from(newFogCells));
        relayClient.send('fog_update', {
          map_id: map.id,
          fog_data: fogData,
        });
      }
    },
    [map],
  );

  const showGrid = map ? (showGridByMap[map.id] ?? true) : true;

  // ТЕПЕРЬ УСЛОВНЫЕ ВОЗВРАТЫ
  if (!mapId) {
    return (
      <div className="workspace-empty">
        Map tab is broken: missing map id.
      </div>
    );
  }

  if (isLoading) {
    return <div className="workspace-empty">Loading map…</div>;
  }

  if (!map) {
    return <div className="workspace-empty">Map not found.</div>;
  }

  const visibleTokens = tokens
    .filter((token) => !pendingDeleteTokenIds.includes(token.id))
    .filter((token) => canSeeToken(token));

  // Создание токена с отправкой в Relay
  const handleAddToken = () => {
    const jitterX = (Math.random() - 0.5) * map.gridSize * 2;
    const jitterY = (Math.random() - 0.5) * map.gridSize * 2;

    createToken.mutate(
      {
        mapId: map.id,
        x: map.width / 2 + jitterX,
        y: map.height / 2 + jitterY,
        characterId: selectedCharacterId || null,
      },
      {
        onSuccess: (newToken) => {
          setSelectedTokenId(newToken.id);

          // Отправляем уведомление другим клиентам
          if (relayClient.status === 'connected') {
            relayClient.send('token_create', {
              token_id: newToken.id,
              map_id: map.id,
              character_id: selectedCharacterId || null,
              x: newToken.x,
              y: newToken.y,
            });
          }
        },
      },
    );
  };

  // Удаление токена с отправкой в Relay
  const handleDeleteSelected = () => {
    if (!selectedTokenId) {
      return;
    }

    const tokenId = selectedTokenId;

    setSelectedTokenId(null);

    setPendingDeleteTokenIds((prev) =>
      prev.includes(tokenId) ? prev : [...prev, tokenId],
    );

    deleteToken.mutate(
      {
        mapId: map.id,
        tokenId,
      },
      {
        onSuccess: () => {
          // Отправляем уведомление другим клиентам
          if (relayClient.status === 'connected') {
            relayClient.send('token_delete', {
              token_id: tokenId,
              map_id: map.id,
            });
          }
        },
        onSettled: () => {
          setPendingDeleteTokenIds((prev) =>
            prev.filter((id) => id !== tokenId),
          );
        },
      },
    );
  };

  const handleLoadImage = async () => {
    try {
      const selected = await open({
        multiple: false,
        filters: [
          {
            name: 'Images',
            extensions: ['png', 'jpg', 'jpeg', 'webp', 'gif'],
          },
        ],
      });

      if (typeof selected === 'string') {
        setPendingImagePath(selected);
      }
    } catch (error) {
      console.error('Failed to select image', error);
    }
  };

  const handleImportConfirm = (options: MapImageImportOptions) => {
    if (!pendingImagePath) return;

    importMapImage.mutate(
      {
        mapId: map.id,
        sourcePath: pendingImagePath,
        options,
      },
      {
        onSuccess: () => {
          setPendingImagePath(null);
        },
        onError: () => {
          setPendingImagePath(null);
        },
      },
    );
  };

  const handleImportCancel = () => {
    setPendingImagePath(null);
  };

  const handleCreateTokenWithCharacter = (
    x: number,
    y: number,
    characterId: string,
  ) => {
    createToken.mutate({
      mapId: map.id,
      x,
      y,
      characterId,
    });
  };

  return (
    <div className="map-tab">
      <div className="map-tab-header">
        <span>{map.name}</span>

        {/* GM-only: управление видимостью */}
        {isGM && (
          <div className="map-scene-controls">
            <label className="map-visibility-toggle" title="Visible to players">
              <input
                type="checkbox"
                checked={map.isVisibleToPlayers}
                onChange={handleToggleVisibility}
                disabled={setMapVisible.isPending}
              />
              👁️
            </label>

            <button
              type="button"
              className={isActiveScene ? 'scene-active-btn active' : 'scene-active-btn'}
              onClick={handleSetActiveScene}
              disabled={setActiveScene.isPending}
              title="Set as active scene for players"
            >
              {isActiveScene ? '🎬 Active Scene' : 'Set Active'}
            </button>
          </div>
        )}

        {/* Индикатор для Player: карта видна или нет */}
        {!isGM && !isLocalMode && (
          <span className="map-player-indicator">
            {map.isVisibleToPlayers ? '👁️ Visible' : '🔒 Hidden'}
          </span>
        )}

        <div className="map-tab-actions">
          {/* Load image и Grid — только GM или локальный режим */}
          {isGM && (
            <>
              <button
                type="button"
                onClick={handleLoadImage}
                disabled={importMapImage.isPending}
              >
                {importMapImage.isPending ? 'Loading…' : 'Load image'}
              </button>

              <label className="map-grid-toggle">
                <input
                  type="checkbox"
                  checked={showGrid}
                  onChange={() => toggleGrid(map.id)}
                />
                Grid
              </label>
            </>
          )}

          {/* Токены — только GM или локальный режим */}
          {isGM && (
            <>
              <select
                value={selectedCharacterId}
                onChange={(event) => setSelectedCharacterId(event.target.value)}
                title="Character for new token"
              >
                <option value="">No character</option>
                {characters.map((character) => (
                  <option key={character.id} value={character.id}>
                    {character.name} ({character.type.toUpperCase()})
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleAddToken}
                disabled={createToken.isPending}
              >
                {createToken.isPending ? 'Adding…' : 'Add token'}
              </button>

              <button
                type="button"
                onClick={handleDeleteSelected}
                disabled={!selectedTokenId || deleteToken.isPending}
              >
                {deleteToken.isPending ? 'Deleting…' : 'Delete token'}
              </button>
            </>
          )}
        </div>

        <span>
          {map.width} × {map.height} · grid {map.gridSize}px
        </span>
      </div>

      <MapCanvas
        map={map}
        tokens={visibleTokens}
        selectedTokenId={selectedTokenId}
        onSelectToken={setSelectedTokenId}
        onMoveToken={handleMoveToken}
        showGrid={showGrid}
        fogCells={new Set()} // Здесь должен быть реальный fogCells из состояния
        fogMode="none"
        onFogChange={handleFogChange}
        onCreateTokenWithCharacter={handleCreateTokenWithCharacter}
      />

      {pendingImagePath && (
        <MapImageImportDialog
          sourcePath={pendingImagePath}
          onConfirm={handleImportConfirm}
          onCancel={handleImportCancel}
          isImporting={importMapImage.isPending}
        />
      )}
    </div>
  );
}