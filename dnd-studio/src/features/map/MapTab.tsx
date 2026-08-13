import { useMap } from '../../shared/api/hooks';

export function MapTab({ mapId }: { mapId?: string }) {
  const { data: map, isLoading } = useMap(mapId);

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

  return (
    <div className="map-placeholder">
      <div className="map-placeholder-card">
        <h3>{map.name}</h3>

        <p>
          {map.width} × {map.height} · grid {map.gridSize}px
        </p>

        <p>
          Map renderer will be added in the next Stage 2 part.
        </p>

        <code>{map.imagePath}</code>
      </div>
    </div>
  );
}