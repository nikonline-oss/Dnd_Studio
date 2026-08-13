import clsx from 'clsx';

import { useWorkspaceStore } from '../stores/workspace';

export function WorkspaceTabBar() {
  const tabs = useWorkspaceStore((state) => state.tabs);
  const activeTabId = useWorkspaceStore((state) => state.activeTabId);
  const setActiveTab = useWorkspaceStore((state) => state.setActiveTab);
  const closeTab = useWorkspaceStore((state) => state.closeTab);

  if (tabs.length === 0) {
    return <div className="workspace-tabbar workspace-tabbar-empty" />;
  }

  return (
    <div className="workspace-tabbar">
      {tabs.map((tab) => {
        const active = tab.id === activeTabId;

        return (
          <div
            key={tab.id}
            className={clsx('workspace-tab', {
              active,
            })}
            onClick={() => setActiveTab(tab.id)}
            role="tab"
            aria-selected={active}
          >
            <span className="workspace-tab-title">{tab.title}</span>

            <button
              type="button"
              className="workspace-tab-close"
              aria-label={`Close ${tab.title}`}
              onClick={(event) => {
                event.stopPropagation();
                closeTab(tab.id);
              }}
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
}