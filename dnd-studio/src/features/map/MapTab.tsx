import { useCallback, useEffect, useRef, useState } from 'react';
import { useUpdateMapFog } from '../../shared/api/hooks';
import { open } from '@tauri-apps/plugin-dialog';
import { MapImageImportDialog } from './MapImageImportDialog';
import type { MapImageImportOptions } from '../../shared/api/hooks';

import {
  useCharacters,
  useCreateToken,
  useDeleteToken,
  useImportMapImage,
  useMap,
  useMoveToken,
  useTokens,
} from '../../shared/api/hooks';
import { useMapSettingsStore } from '../../shared/stores/mapSettings';
import { useTableStore } from '../../shared/stores/table';

import { MapCanvas } from './MapCanvas';

export function MapTab({ mapId }: { mapId?: string }) {
  const { data: map, isLoading } = useMap(mapId);
  const { data: tokens = [] } = useTokens(mapId);
  const { data: characters = [] } = useCharacters(Boolean(mapId));

  const createToken = useCreateToken();
  const moveToken = useMoveToken();
  const deleteToken = useDeleteToken();
  const importMapImage = useImportMapImage();

  const showGridByMap = useMapSettingsStore((state) => state.showGridByMap);
  const toggleGrid = useMapSettingsStore((state) => state.toggleGrid);

  const setSelectedMapId = useTableStore((state) => state.setSelectedMapId);
  const setSelectedTokenIdGlobal = useTableStore(
    (state) => state.setSelectedTokenId,
  );

  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);
  const [pendingDeleteTokenIds, setPendingDeleteTokenIds] = useState<string[]>([]);
  const [selectedCharacterId, setSelectedCharacterId] = useState<string>('');

  const updateMapFog = useUpdateMapFog();
  const [fogMode, setFogMode] = useState<'none' | 'add' | 'remove'>('none');
  const saveFogTimeoutRef = useRef<number | null>(null);

  // Локальное состояние тумана
  const [localFogCells, setLocalFogCells] = useState<Set<string>>(new Set());

  const [pendingImagePath, setPendingImagePath] = useState<string | null>(null);

  // Синхронизация с БД при загрузке карты
  useEffect(() => {
    if (map?.fogData) {
      try {
        const parsed = JSON.parse(map.fogData);
        if (Array.isArray(parsed)) {
          setLocalFogCells(new Set(parsed));
        } else {
          setLocalFogCells(new Set());
        }
      } catch {
        setLocalFogCells(new Set());
      }
    } else {
      setLocalFogCells(new Set());
    }
  }, [map?.id, map?.fogData]);

  // Debounce сохранения
  useEffect(() => {
    if (!map) return;

    if (saveFogTimeoutRef.current) {
      window.clearTimeout(saveFogTimeoutRef.current);
    }

    saveFogTimeoutRef.current = window.setTimeout(() => {
      const array = Array.from(localFogCells);
      const fogData = array.length > 0 ? JSON.stringify(array) : null;

      const currentDbArray = map.fogData ? JSON.parse(map.fogData) : [];
      if (JSON.stringify(array) !== JSON.stringify(currentDbArray)) {
        updateMapFog.mutate({ mapId: map.id, fogData });
      }
    }, 800);

    return () => {
      if (saveFogTimeoutRef.current) {
        window.clearTimeout(saveFogTimeoutRef.current);
      }
    };
  }, [localFogCells, map, updateMapFog]);

  const handleFogChange = useCallback((newCells: Set<string>) => {
    setLocalFogCells(new Set(newCells));
  }, []);

  useEffect(() => {
    if (map) {
      setSelectedMapId(map.id);
    } else {
      setSelectedMapId(null);
    }

    return () => {
      // Очистка глобального стора при размонтировании вкладки
      setSelectedMapId(null);
      setSelectedTokenIdGlobal(null);
    };
  }, [map?.id, setSelectedMapId, setSelectedTokenIdGlobal]);

  useEffect(() => {
    setSelectedTokenIdGlobal(selectedTokenId);
  }, [selectedTokenId, setSelectedTokenIdGlobal]);

  // 2. Вычисляемые значения
  const showGrid = map ? (showGridByMap[map.id] ?? true) : true;

  // 3. Early returns (досрочные выходы)
  if (!mapId) {
    return (
      <div className="workspace-empty">
        Map tab is broken: missing map id.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="workspace-empty">
        Loading map…
      </div>
    );
  }

  if (!map) {
    return (
      <div className="workspace-empty">
        Map not found.
      </div>
    );
  }

  // 4. Хендлеры и рендер (здесь TS уже знает, что map точно не null)
  const visibleTokens = tokens.filter(
    (token) => !pendingDeleteTokenIds.includes(token.id),
  );

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
        onSuccess: (data) => {
          setSelectedTokenId(data.id);
        },
      },
    );
  };

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
        onSettled: () => {
          setPendingDeleteTokenIds((prev) =>
            prev.filter((id) => id !== tokenId),
          );
        },
      },
    );
  };

  const handleMoveToken = async (
    tokenId: string,
    x: number,
    y: number,
  ) => {
    try {
      await moveToken.mutateAsync({
        mapId: map.id,
        tokenId,
        x,
        y,
      });
    } catch {
      // Rollback уже есть в useMoveToken.
    }
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
        // Открываем диалог вместо прямого импорта
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

  return (
    <div className="map-tab">
      <div className="map-tab-header">
        <span>{map.name}</span>

        <div className="map-tab-actions">
          <div className="map-fog-controls">
            <button
              type="button"
              className={fogMode === 'none' ? 'active' : ''}
              onClick={() => setFogMode('none')}
              title="Navigation mode"
            >
              Map
            </button>
            <button
              type="button"
              className={fogMode === 'add' ? 'active' : ''}
              onClick={() => setFogMode('add')}
              title="Add Fog"
            >
              Fog +
            </button>
            <button
              type="button"
              className={fogMode === 'remove' ? 'active' : ''}
              onClick={() => setFogMode('remove')}
              title="Remove Fog"
            >
              Fog -
            </button>
            <button
              type="button"
              onClick={() => handleFogChange(new Set())}
              title="Clear all fog"
              disabled={localFogCells.size === 0}
            >
              Clear
            </button>
          </div>
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
        fogCells={localFogCells}
        fogMode={fogMode}
        onFogChange={handleFogChange}
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