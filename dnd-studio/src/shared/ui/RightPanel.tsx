import { useUiStore } from '../stores/ui';

export function RightPanel() {
  const activeRightTab = useUiStore((state) => state.activeRightTab);

  return (
    <aside className="panel right-panel" aria-label="Right panel content">
      <div className="panel-content">
        {activeRightTab === 'inspector' && (
          <div className="empty-state">Inspector will appear here.</div>
        )}

        {activeRightTab === 'journalToc' && (
          <div className="empty-state">Journal table of contents will appear here.</div>
        )}
      </div>
    </aside>
  );
}