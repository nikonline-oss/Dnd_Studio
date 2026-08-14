import { FormEvent, useState } from 'react';

import {
  useActiveCampaign,
  useCharacters,
  useCreateCharacter,
  useCreateMap,
  useMaps,
} from '../api/hooks';
import { useUiStore } from '../stores/ui';
import { useWorkspaceStore } from '../stores/workspace';

function NavigatorPanel() {
  const [newMapName, setNewMapName] = useState('');
  const [newCharacterName, setNewCharacterName] = useState('');
  const [newCharacterType, setNewCharacterType] = useState<'pc' | 'npc' | 'monster'>('pc');

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

export function LeftPanel() {
  const activeLeftTab = useUiStore((state) => state.activeLeftTab);

  return (
    <aside className="panel left-panel" aria-label="Left panel content">
      <div className="panel-content">
        {activeLeftTab === 'navigator' && <NavigatorPanel />}

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