import { useEffect } from 'react';

import {
  useActiveCampaign,
  useMaps,
  useTokens,
} from '../../shared/api/hooks';
import { useEncounterStore } from '../../shared/stores/encounter';
import { useWorkspaceStore } from '../../shared/stores/workspace';

export function InitiativePanel() {
  const { data: activeCampaign } = useActiveCampaign();
  const { data: maps = [], isLoading: areMapsLoading } = useMaps(
    Boolean(activeCampaign),
  );

  const tabs = useWorkspaceStore((state) => state.tabs);
  const activeTabId = useWorkspaceStore((state) => state.activeTabId);

  const selectedMapId = useEncounterStore((state) => state.selectedMapId);
  const setSelectedMapId = useEncounterStore((state) => state.setSelectedMapId);

  const encounters = useEncounterStore((state) => state.encounters);

  const addTokens = useEncounterStore((state) => state.addTokens);
  const removeEntry = useEncounterStore((state) => state.removeEntry);
  const setInitiative = useEncounterStore((state) => state.setInitiative);
  const toggleStarted = useEncounterStore((state) => state.toggleStarted);
  const nextTurn = useEncounterStore((state) => state.nextTurn);
  const resetTurn = useEncounterStore((state) => state.resetTurn);
  const clearEncounter = useEncounterStore((state) => state.clearEncounter);
  const pruneMissingTokens = useEncounterStore(
    (state) => state.pruneMissingTokens,
  );

  const activeMapTab = tabs.find(
    (tab) => tab.id === activeTabId && tab.kind === 'map',
  );

  const fallbackMapId =
    selectedMapId && maps.some((map) => map.id === selectedMapId)
      ? selectedMapId
      : activeMapTab?.entityId ?? maps[0]?.id ?? null;

  useEffect(() => {
    if (fallbackMapId && fallbackMapId !== selectedMapId) {
      setSelectedMapId(fallbackMapId);
    }
  }, [fallbackMapId, selectedMapId, setSelectedMapId]);

  const effectiveMapId = fallbackMapId;

  const { data: tokens = [], isLoading: areTokensLoading } = useTokens(
    effectiveMapId ?? undefined,
  );

  const encounter = effectiveMapId
    ? encounters[effectiveMapId]
    : undefined;

  const entries = encounter?.entries ?? [];
  const started = encounter?.started ?? false;
  const round = encounter?.round ?? 1;
  const activeEntryId = encounter?.activeEntryId ?? null;

  const sortedEntries = [...entries].sort((a, b) => {
    if (b.initiative !== a.initiative) {
      return b.initiative - a.initiative;
    }

    return a.label.localeCompare(b.label);
  });

  // Удаляем участников, если их токены были удалены с карты.
  useEffect(() => {
    if (!effectiveMapId || areTokensLoading) {
      return;
    }

    pruneMissingTokens(
      effectiveMapId,
      tokens.map((token) => token.id),
    );
  }, [effectiveMapId, areTokensLoading, tokens, pruneMissingTokens]);

  if (!activeCampaign) {
    return (
      <div className="empty-state">
        Open a campaign to use initiative tracker.
      </div>
    );
  }

  if (areMapsLoading) {
    return <div className="empty-state">Loading maps…</div>;
  }

  if (!effectiveMapId) {
    return (
      <div className="empty-state">
        Create or open a map to use initiative tracker.
      </div>
    );
  }

  const handleAddTokens = () => {
    const existingTokenIds = new Set(entries.map((entry) => entry.tokenId));

    const tokensToAdd = tokens
      .filter((token) => !existingTokenIds.has(token.id))
      .map((token, index) => ({
        tokenId: token.id,
        label: token.characterName ?? `Token ${index + 1}`,
        initiative: 0,
      }));

    addTokens(effectiveMapId, tokensToAdd);
  };

  return (
    <div className="initiative">
      <div className="initiative-toolbar">
        <select
          value={effectiveMapId}
          onChange={(event) => setSelectedMapId(event.target.value)}
        >
          {maps.map((map) => (
            <option key={map.id} value={map.id}>
              {map.name}
            </option>
          ))}
        </select>

        <span className="initiative-round">Round {round}</span>

        <div className="initiative-actions">
          <button
            type="button"
            onClick={handleAddTokens}
            disabled={areTokensLoading || tokens.length === 0}
          >
            Add tokens
          </button>

          <button
            type="button"
            onClick={() => toggleStarted(effectiveMapId)}
            disabled={entries.length === 0}
          >
            {started ? 'Pause' : 'Start'}
          </button>

          <button
            type="button"
            onClick={() => nextTurn(effectiveMapId)}
            disabled={!started || entries.length === 0}
          >
            Next turn
          </button>

          <button
            type="button"
            onClick={() => resetTurn(effectiveMapId)}
            disabled={entries.length === 0}
          >
            Reset
          </button>

          <button
            type="button"
            onClick={() => clearEncounter(effectiveMapId)}
            disabled={entries.length === 0}
          >
            Clear
          </button>
        </div>
      </div>

      <div className="initiative-content">
        {sortedEntries.length === 0 && (
          <div className="empty-state">
            Add tokens from the current map to start combat.
          </div>
        )}

        {sortedEntries.length > 0 && (
          <div className="initiative-table">
            <div className="initiative-row initiative-row-header">
              <span>Combatant</span>
              <span>Initiative</span>
              <span>Active</span>
              <span />
            </div>

            {sortedEntries.map((entry) => {
              const isActive = entry.id === activeEntryId;

              return (
                <div
                  key={entry.id}
                  className={
                    isActive
                      ? 'initiative-row initiative-row-active'
                      : 'initiative-row'
                  }
                >
                  <span>{entry.label}</span>

                  <input
                    type="number"
                    value={entry.initiative}
                    onChange={(event) =>
                      setInitiative(
                        effectiveMapId,
                        entry.id,
                        Number(event.target.value) || 0,
                      )
                    }
                  />

                  <span>{isActive ? '▶' : ''}</span>

                  <button
                    type="button"
                    onClick={() => removeEntry(effectiveMapId, entry.id)}
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}