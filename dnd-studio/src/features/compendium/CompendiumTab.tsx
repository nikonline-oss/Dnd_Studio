import { useMemo, useState } from 'react';

import {
  useCompendiumEntries,
  useCreateCompendiumEntry,
  useDeleteCompendiumEntry,
} from '../../shared/api/hooks';
import { CompendiumEntryEditor } from './CompendiumEntryEditor';
import type { CompendiumEntrySummary } from '../../shared/api/bindings';

export function CompendiumTab({ compendiumId }: { compendiumId?: string }) {
  const { data: entries = [], isLoading } = useCompendiumEntries(compendiumId);
  const createEntry = useCreateCompendiumEntry();
  const deleteEntry = useDeleteCompendiumEntry();

  const [selectedEntry, setSelectedEntry] = useState<CompendiumEntrySummary | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newEntryName, setNewEntryName] = useState('');

  const filteredEntries = useMemo(() => {
    if (!searchQuery.trim()) {
      return entries;
    }

    const query = searchQuery.toLowerCase();

    return entries.filter((entry) =>
      entry.name.toLowerCase().includes(query),
    );
  }, [entries, searchQuery]);

  if (!compendiumId) {
    return <div className="workspace-empty">Missing compendium id.</div>;
  }

  if (isLoading) {
    return <div className="workspace-empty">Loading compendium…</div>;
  }

  const handleAddEntry = () => {
    const name = newEntryName.trim();
    if (!name) return;

    createEntry.mutate(
      {
        compendiumId,
        entryKey: name.toLowerCase().replace(/\s+/g, '-'),
        name,
        dataJson: JSON.stringify({ description: '' }),
      },
      {
        onSuccess: () => setNewEntryName(''),
      },
    );
  };

  const handleDeleteEntry = () => {
    if (!selectedEntry) return;

    if (!window.confirm(`Delete entry "${selectedEntry.name}"?`)) {
      return;
    }

    deleteEntry.mutate(
      {
        id: selectedEntry.id,
        compendiumId,
      },
      {
        onSuccess: () => {
          setSelectedEntry(null);
        },
      },
    );
  };

  return (
    <div className="compendium-tab">
      {/* Левая панель: список записей */}
      <div className="compendium-sidebar">
        <div className="compendium-add">
          <input
            value={newEntryName}
            onChange={(e) => setNewEntryName(e.target.value)}
            placeholder="New entry name"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddEntry();
            }}
          />
          <button
            type="button"
            onClick={handleAddEntry}
            disabled={!newEntryName.trim() || createEntry.isPending}
          >
            Add
          </button>
        </div>

        <div className="compendium-search">
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search entries…"
          />
        </div>

        <div className="compendium-list">
          {filteredEntries.length === 0 && (
            <div className="empty-state">
              {entries.length === 0 ? 'No entries yet.' : 'No matches found.'}
            </div>
          )}

          {filteredEntries.map((entry) => (
            <button
              key={entry.id}
              type="button"
              className={
                selectedEntry?.id === entry.id
                  ? 'compendium-item active'
                  : 'compendium-item'
              }
              onClick={() => setSelectedEntry(entry)}
            >
              {entry.name}
              {entry.sourcePluginId && <span className="plugin-badge">Plugin</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Правая панель: редактор записи */}
      <div className="compendium-content">
        {selectedEntry ? (
          <CompendiumEntryEditor
            entry={selectedEntry}
            onClose={() => setSelectedEntry(null)}
            onDelete={handleDeleteEntry}
          />
        ) : (
          <div className="empty-state">
            Select an entry to view and edit.
          </div>
        )}
      </div>
    </div>
  );
}