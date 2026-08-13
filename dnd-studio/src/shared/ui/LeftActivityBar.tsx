import clsx from 'clsx';
import { Book, Folder, Puzzle, type LucideIcon } from 'lucide-react';

import { useUiStore, type LeftTab } from '../stores/ui';

const items: Array<{
  id: LeftTab;
  label: string;
  Icon: LucideIcon;
}> = [
  {
    id: 'navigator',
    label: 'Campaign Navigator',
    Icon: Folder,
  },
  {
    id: 'plugins',
    label: 'Plugins',
    Icon: Puzzle,
  },
  {
    id: 'compendiums',
    label: 'Compendiums',
    Icon: Book,
  },
];

export function LeftActivityBar() {
  const activeLeftTab = useUiStore((state) => state.activeLeftTab);
  const leftVisible = useUiStore((state) => state.leftVisible);
  const toggleLeftTab = useUiStore((state) => state.toggleLeftTab);

  return (
    <nav className="activity-bar activity-bar-left" aria-label="Left panel tabs">
      {items.map(({ id, label, Icon }) => {
        const selected = activeLeftTab === id;
        const open = leftVisible && selected;

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
            onClick={() => toggleLeftTab(id)}
          >
            <Icon size={18} strokeWidth={1.8} />
          </button>
        );
      })}
    </nav>
  );
}