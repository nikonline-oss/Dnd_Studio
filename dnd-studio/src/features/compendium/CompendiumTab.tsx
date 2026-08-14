import { useEffect, useMemo, useState } from 'react';

import {
  useCompendiumEntries,
  useCreateCompendiumEntry,
  useDeleteCompendiumEntry,
  useUpdateCompendiumEntry,
} from '../../shared/api/hooks';

export function CompendiumTab({ compendiumId }: { compendiumId?: string }) {
  const { data: entries = [], isLoading } = useCompendiumEntries(compendiumId);
  const createEntry = useCreateCompendiumEntry();
  const updateEntry = useUpdateCompendiumEntry();
  const deleteEntry = useDeleteCompendiumEntry();

  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Форма добавления
  const [newEntryName, setNewEntryName] = useState('');

  // Форма редактирования
  const [editName, setEditName] = useState('');
  const [editDataJson, setEditDataJson] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);

  // Синхронизация формы редактирования с выбранной записью
  const selectedEntry = entries.find((entry) => entry.id === selectedEntryId);

  useEffect(() => {
    if (selectedEntry) {
      setEditName(selectedEntry.name);
      setEditDataJson(selectedEntry.dataJson);
      setJsonError(null);
    }
  }, [selectedEntry?.id, selectedEntry?.name, selectedEntry?.dataJson]);

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

  const handleSaveEntry = () => {
    if (!selectedEntry) return;

    const name = editName.trim();
    if (!name) return;

    // Валидация JSON на клиенте
    try {
      JSON.parse(editDataJson);
      setJsonError(null);
    } catch (error) {
      setJsonError(`Invalid JSON: ${error}`);
      return;
    }

    updateEntry.mutate({
      id: selectedEntry.id,
      name,
      dataJson: editDataJson,
    });
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
          setSelectedEntryId(null);
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

      {/* Правая панель: редактор записи */}
      <div className="compendium-content">
        {selectedEntry ? (
          <>
            <div className="compendium-editor-header">
              <input
                className="compendium-name-input"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Entry name"
              />

              <div className="compendium-editor-actions">
                <button
                  type="button"
                  onClick={handleSaveEntry}
                  disabled={updateEntry.isPending || !editName.trim()}
                >
                  {updateEntry.isPending ? 'Saving…' : 'Save'}
                </button>

                <button
                  type="button"
                  className="btn-danger"
                  onClick={handleDeleteEntry}
                  disabled={deleteEntry.isPending}
                >
                  {deleteEntry.isPending ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </div>

            <div className="compendium-editor-meta">
              <code>{selectedEntry.entryKey}</code>
            </div>

            {jsonError && (
              <div className="compendium-json-error">{jsonError}</div>
            )}

            <textarea
              className="compendium-json-editor"
              value={editDataJson}
              onChange={(e) => {
                setEditDataJson(e.target.value);
                setJsonError(null);
              }}
              placeholder='{ "description": "..." }'
              spellCheck={false}
            />
          </>
        ) : (
          <div className="empty-state">
            Select an entry to view and edit.
          </div>
        )}
      </div>
    </div>
  );
}