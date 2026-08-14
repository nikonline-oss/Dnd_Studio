import { useState } from 'react';

import {
  useCompendiumEntries,
  useCreateCompendiumEntry,
} from '../../shared/api/hooks';

export function CompendiumTab({ compendiumId }: { compendiumId?: string }) {
  const { data: entries = [], isLoading } = useCompendiumEntries(compendiumId);
  const createEntry = useCreateCompendiumEntry();

  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [newEntryName, setNewEntryName] = useState('');

  if (!compendiumId) {
    return <div className="workspace-empty">Missing compendium id.</div>;
  }

  if (isLoading) {
    return <div className="workspace-empty">Loading compendium…</div>;
  }

  const selectedEntry = entries.find((entry) => entry.id === selectedEntryId);

  const handleAddEntry = () => {
    const name = newEntryName.trim();
    if (!name) return;

    createEntry.mutate(
      {
        compendiumId,
        entryKey: name.toLowerCase().replace(/\s+/g, '-'),
        name,
        dataJson: JSON.stringify({ description: 'New entry' }),
      },
      {
        onSuccess: () => setNewEntryName(''),
      },
    );
  };

  return (
    <div className="compendium-tab">
      <div className="compendium-sidebar">
        <div className="compendium-add">
          <input
            value={newEntryName}
            onChange={(e) => setNewEntryName(e.target.value)}
            placeholder="New entry name"
          />
          <button
            type="button"
            onClick={handleAddEntry}
            disabled={!newEntryName.trim() || createEntry.isPending}
          >
            Add
          </button>
        </div>

        <div className="compendium-list">
          {entries.length === 0 && (
            <div className="empty-state">No entries yet.</div>
          )}

          {entries.map((entry) => (
            <button
              key={entry.id}
              type="button"
              className={
                selectedEntryId === entry.id
                  ? 'compendium-item active'
                  : 'compendium-item'
              }
              onClick={() => setSelectedEntryId(entry.id)}
            >
              {entry.name}
            </button>
          ))}
        </div>
      </div>

      <div className="compendium-content">
        {selectedEntry ? (
          <>
            <div className="compendium-content-header">
              <h2>{selectedEntry.name}</h2>
              <code>{selectedEntry.entryKey}</code>
            </div>

            <pre className="compendium-json">
              {JSON.stringify(JSON.parse(selectedEntry.dataJson), null, 2)}
            </pre>
          </>
        ) : (
          <div className="empty-state">Select an entry to view details.</div>
        )}
      </div>
    </div>
  );
}