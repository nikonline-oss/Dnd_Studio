import clsx from 'clsx';
import { useUiStore, type BottomTab } from '../stores/ui';

const tabs: Array<{ id: BottomTab; label: string }> = [
  { id: 'chat', label: 'Chat' },
  { id: 'logs', label: 'Logs' },
  { id: 'dslTerminal', label: 'DSL Terminal' },
];

export function BottomPanel() {
  const activeBottomTab = useUiStore((state) => state.activeBottomTab);
  const setActiveBottomTab = useUiStore((state) => state.setActiveBottomTab);

  return (
    <section className="panel">
      <div className="panel-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={clsx('panel-tab', {
              active: activeBottomTab === tab.id,
            })}
            onClick={() => setActiveBottomTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="panel-content">
        {activeBottomTab === 'chat' && (
          <div className="empty-state">Chat will appear here.</div>
        )}

        {activeBottomTab === 'logs' && (
          <div className="empty-state">Logs will appear here.</div>
        )}

        {activeBottomTab === 'dslTerminal' && (
          <div className="empty-state">DSL terminal is planned for Phase 2+.</div>
        )}
      </div>
    </section>
  );
}