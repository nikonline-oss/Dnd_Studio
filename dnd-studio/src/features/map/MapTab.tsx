import { useState } from 'react';

import {
  useCreateToken,
  useDeleteToken,
  useMap,
  useMoveToken,
  useTokens,
} from '../../shared/api/hooks';

import { MapCanvas } from './MapCanvas';

export function MapTab({ mapId }: { mapId?: string }) {
  const { data: map, isLoading } = useMap(mapId);
  const { data: tokens = [] } = useTokens(mapId);

  const createToken = useCreateToken();
  const moveToken = useMoveToken();
  const deleteToken = useDeleteToken();

  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);
  const [pendingDeleteTokenIds, setPendingDeleteTokenIds] = useState<string[]>([]);

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
      prev.includes(tokenId)
        ? prev
        : [...prev, tokenId],
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
      // Здесь просто не даём promise упасть в MapCanvas.
    }
  };

  return (
    <div className="map-tab">
      <div className="map-tab-header">
        <span>{map.name}</span>

        <div className="map-tab-actions">
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