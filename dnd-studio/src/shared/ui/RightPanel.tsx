import {
  useActiveCampaign,
  useCreateJournalEntry,
  useJournalEntries,
} from '../api/hooks';
import { useUiStore } from '../stores/ui';
import { useWorkspaceStore } from '../stores/workspace';

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
        {activeRightTab === 'inspector' && (
          <div className="empty-state">Inspector will appear here.</div>
        )}

        {activeRightTab === 'journalToc' && <JournalToc />}
      </div>
    </aside>
  );
}