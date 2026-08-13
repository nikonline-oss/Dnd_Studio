import clsx from 'clsx';
import { List, Search, type LucideIcon } from 'lucide-react';

import { useUiStore, type RightTab } from '../stores/ui';

const items: Array<{
  id: RightTab;
  label: string;
  Icon: LucideIcon;
}> = [
  {
    id: 'inspector',
    label: 'Inspector',
    Icon: Search,
  },
  {
    id: 'journalToc',
    label: 'Journal Table of Contents',
    Icon: List,
  },
];

export function RightActivityBar() {
  const activeRightTab = useUiStore((state) => state.activeRightTab);
  const rightVisible = useUiStore((state) => state.rightVisible);
  const toggleRightTab = useUiStore((state) => state.toggleRightTab);

  return (
    <nav className="activity-bar activity-bar-right" aria-label="Right panel tabs">
      {items.map(({ id, label, Icon }) => {
        const selected = activeRightTab === id;
        const open = rightVisible && selected;

        return (
          <button
            key={id}
            type="button"
            title={label}
            aria-label={label}
            aria-pressed={open}
            className={clsx('activity-bar-button', {
              selected,
              open,
            })}
            onClick={() => toggleRightTab(id)}
          >
            <Icon size={18} strokeWidth={1.8} />
          </button>
        );
      })}
    </nav>
  );
}