import clsx from 'clsx';

import { ChatPanel } from '../../features/chat/ChatPanel';
import { InitiativePanel } from '../../features/initiative/InitiativePanel';
import { useUiStore, type BottomTab } from '../stores/ui';
import { ConnectionPanel } from '../../features/multiplayer/ConnectionPanel';

const tabs: Array<{
  id: BottomTab;
  label: string;
}> = [
    {
      id: 'initiative',
      label: 'Initiative',
    },
    {
      id: 'chat',
      label: 'Chat',
    },
    {
      id: 'logs',
      label: 'Logs',
    },
    {
      id: 'dslTerminal',
      label: 'DSL Terminal',
    },
    {
      id: 'multiplayer',
      label: 'Multiplayer'
    },
  ];

export function BottomPanel() {
  const activeBottomTab = useUiStore((state) => state.activeBottomTab);
  const setActiveBottomTab = useUiStore(
    (state) => state.setActiveBottomTab,
  );

  return (
    <section className="panel bottom-panel">
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
        {activeBottomTab === 'initiative' && <InitiativePanel />}

        {activeBottomTab === 'chat' && <ChatPanel />}

        {activeBottomTab === 'logs' && (
          <div className="empty-state">Logs will appear here.</div>
        )}

        {activeBottomTab === 'dslTerminal' && (
          <div className="empty-state">
            DSL terminal is planned for Phase 2+.
          </div>
        )}

        {activeBottomTab === 'multiplayer' && <ConnectionPanel />}
      </div>
    </section>
  );
}