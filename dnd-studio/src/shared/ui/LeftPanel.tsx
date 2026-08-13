import clsx from 'clsx';
import { useUiStore, type LeftTab } from '../stores/ui';

const tabs: Array<{ id: LeftTab; label: string }> = [
  { id: 'navigator', label: 'Navigator' },
  { id: 'plugins', label: 'Plugins' },
  { id: 'compendiums', label: 'Compendiums' },
];

export function LeftPanel() {
  const activeLeftTab = useUiStore((state) => state.activeLeftTab);
  const setActiveLeftTab = useUiStore((state) => state.setActiveLeftTab);

  return (
    <aside className="panel">
      <div className="panel-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={clsx('panel-tab', {
              active: activeLeftTab === tab.id,
            })}
            onClick={() => setActiveLeftTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="panel-content">
        {activeLeftTab === 'navigator' && (
          <div className="empty-state">Campaign navigator will appear here.</div>
        )}

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