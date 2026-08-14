import { useState } from 'react';
import { open } from '@tauri-apps/plugin-dialog';

import {
  useCharacters,
  useCreateToken,
  useDeleteToken,
  useImportMapImage,
  useMap,
  useMoveToken,
  useTokens,
} from '../../shared/api/hooks';

import { MapCanvas } from './MapCanvas';

export function MapTab({ mapId }: { mapId?: string }) {
  const { data: map, isLoading } = useMap(mapId);
  const { data: tokens = [] } = useTokens(mapId);
  const { data: characters = [] } = useCharacters(Boolean(mapId));

  const createToken = useCreateToken();
  const moveToken = useMoveToken();
  const deleteToken = useDeleteToken();
  const importMapImage = useImportMapImage();

  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);
  const [pendingDeleteTokenIds, setPendingDeleteTokenIds] = useState<string[]>([]);
  const [selectedCharacterId, setSelectedCharacterId] = useState<string>('');

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
        importMapImage.mutate({
          mapId: map.id,
          sourcePath: selected,
        });
      }
    } catch (error) {
      console.error('Failed to select image', error);
    }
  };

  return (
    <div className="map-tab">
      <div className="map-tab-header">
        <span>{map.name}</span>

        <div className="map-tab-actions">
          <button
            type="button"
            onClick={handleLoadImage}
            disabled={importMapImage.isPending}
          >
            {importMapImage.isPending ? 'Loading…' : 'Load image'}
          </button>
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
      />
    </div>
  );
}