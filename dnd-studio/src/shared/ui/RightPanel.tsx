import {
  useActiveCampaign,
  useAssignTokenCharacter,
  useCharacters,
  useCreateJournalEntry,
  useJournalEntries,
  useTokens,
} from '../api/hooks';
import { useTableStore } from '../stores/table';
import { useUiStore } from '../stores/ui';
import { useWorkspaceStore } from '../stores/workspace';

function InspectorPanel() {
  const selectedMapId = useTableStore((state) => state.selectedMapId);
  const selectedTokenId = useTableStore((state) => state.selectedTokenId);

  const { data: tokens = [], isLoading: areTokensLoading } = useTokens(
    selectedMapId ?? undefined,
  );

  const token = tokens.find((item) => item.id === selectedTokenId);

  const { data: characters = [] } = useCharacters(Boolean(selectedMapId));

  const assignTokenCharacter = useAssignTokenCharacter();

  const openCharacterTab = useWorkspaceStore(
    (state) => state.openCharacterTab,
  );

  if (!selectedMapId || !selectedTokenId) {
    return (
      <div className="empty-state">
        Select a token on the map.
      </div>
    );
  }

  if (areTokensLoading) {
    return <div className="empty-state">Loading token…</div>;
  }

  if (!token) {
    return <div className="empty-state">Token not found.</div>;
  }

  const assignedCharacter = characters.find(
    (character) => character.id === token.characterId,
  );

  return (
    <div className="inspector">
      <div className="inspector-section">Token</div>

      <div className="inspector-row">
        <span>ID</span>
        <code>{token.id.slice(0, 8)}</code>
      </div>

      <div className="inspector-row">
        <span>Position</span>
        <span>
          {Math.round(token.x ?? 0)}, {Math.round(token.y ?? 0)}
        </span>
      </div>

      <div className="inspector-row">
        <span>Visible</span>
        <span>{token.isVisible ? 'Yes' : 'No'}</span>
      </div>

      <div className="inspector-section">Character</div>

      <select
        value={token.characterId ?? ''}
        disabled={assignTokenCharacter.isPending}
        onChange={(event) => {
          assignTokenCharacter.mutate({
            mapId: selectedMapId,
            tokenId: token.id,
            characterId: event.target.value || null,
          });
        }}
      >
        <option value="">No character</option>

        {characters.map((character) => (
          <option key={character.id} value={character.id}>
            {character.name} ({character.type.toUpperCase()})
          </option>
        ))}
      </select>

      {assignedCharacter && (
        <button
          type="button"
          onClick={() => openCharacterTab(assignedCharacter)}
        >
          Open character
        </button>
      )}
    </div>
  );
}

function JournalToc() {
  const { data: activeCampaign } = useActiveCampaign();

  const { data: entries = [], isLoading } = useJournalEntries(
    Boolean(activeCampaign),
  );

  const createJournalEntry = useCreateJournalEntry();
  const openJournalTab = useWorkspaceStore((state) => state.openJournalTab);

  if (!activeCampaign) {
    return (
      <div className="empty-state">
        Open a campaign to see the journal.
      </div>
    );
  }

  const onCreateEntry = () => {
    createJournalEntry.mutate(
      {
        title: 'New entry',
        folderPath: '/',
      },
      {
        onSuccess: (entry) => {
          openJournalTab(entry);
        },
      },
    );
  };

  return (
    <div className="journal-toc">
      <div className="journal-toc-header">
        <span>Journal</span>

        <button
          type="button"
          onClick={onCreateEntry}
          disabled={createJournalEntry.isPending}
        >
          {createJournalEntry.isPending ? '…' : '+ Entry'}
        </button>
      </div>

      {isLoading && <div className="empty-state">Loading entries…</div>}

      {!isLoading && entries.length === 0 && (
        <div className="empty-state">No journal entries yet.</div>
      )}

      <ul className="journal-toc-list">
        {entries.map((entry) => (
          <li key={entry.id}>
            <button
              type="button"
              className="journal-toc-item"
              onClick={() => openJournalTab(entry)}
            >
              <span>{entry.title}</span>
              <small>{entry.folderPath}</small>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function RightPanel() {
  const activeRightTab = useUiStore((state) => state.activeRightTab);

  return (
    <aside className="panel right-panel" aria-label="Right panel content">
      <div className="panel-content">
        {activeRightTab === 'inspector' && <InspectorPanel />}

        {activeRightTab === 'journalToc' && <JournalToc />}
      </div>
    </aside>
  );
}