import { useUiStore } from '../stores/ui';

import { FormEvent, useState } from 'react';

import {
  useActiveCampaign,
  useCreateMap,
  useMaps,
} from '../api/hooks';

function NavigatorPanel() {
  const [newMapName, setNewMapName] = useState('');

  const { data: activeCampaign } = useActiveCampaign();
  const { data: maps = [], isLoading } = useMaps(Boolean(activeCampaign));
  const createMap = useCreateMap();

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

  return (
    <div className="navigator">
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

        {isLoading && (
          <div className="empty-state">Loading maps…</div>
        )}

        {!isLoading && maps.length === 0 && (
          <div className="empty-state">No maps yet.</div>
        )}

        <ul className="navigator-list">
          {maps.map((map) => (
            <li key={map.id}>
              <button type="button" className="navigator-item">
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


export function LeftPanel() {
  const activeLeftTab = useUiStore((state) => state.activeLeftTab);

  return (
    <aside className="panel left-panel" aria-label="Left panel content">
      <div className="panel-content">
        {activeLeftTab === 'navigator' && <NavigatorPanel /> }

        {activeLeftTab === 'plugins' && (
          <div className="empty-state">Plugin browser will appear here.</div>
        )}

        {activeLeftTab === 'compendiums' && (
          <div className="empty-state">Compendiums will appear here.</div>
        )}
      </div>
    </aside>
  );
}