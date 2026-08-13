import { useMap } from '../../shared/api/hooks';

import { MapCanvas } from './MapCanvas';

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
    <div className="map-tab">
      <div className="map-tab-header">
        <span>{map.name}</span>

        <span>
          {map.width} × {map.height} · grid {map.gridSize}px
        </span>
      </div>

      <MapCanvas map={map} />
    </div>
  );
}