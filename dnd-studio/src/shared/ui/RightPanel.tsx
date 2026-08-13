import clsx from 'clsx';
import { useUiStore, type RightTab } from '../stores/ui';

const tabs: Array<{ id: RightTab; label: string }> = [
  { id: 'inspector', label: 'Inspector' },
  { id: 'journalToc', label: 'Journal TOC' },
];

export function RightPanel() {
  const activeRightTab = useUiStore((state) => state.activeRightTab);
  const setActiveRightTab = useUiStore((state) => state.setActiveRightTab);

  return (
    <aside className="panel">
      <div className="panel-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={clsx('panel-tab', {
              active: activeRightTab === tab.id,
            })}
            onClick={() => setActiveRightTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="panel-content">
        {activeRightTab === 'inspector' && (
          <div className="empty-state">Inspector will appear here.</div>
        )}

        {activeRightTab === 'journalToc' && (
          <div className="empty-state">Journal TOC will appear here.</div>
        )}
      </div>
    </aside>
  );
}