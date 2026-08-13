import { useEffect } from 'react';
import { useUiStore } from '../stores/ui';

export function useGlobalShortcuts() {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const mod = event.ctrlKey || event.metaKey;

      if (!mod) {
        return;
      }

      const key = event.key.toLowerCase();
      const ui = useUiStore.getState();

      if (key === 'b' && !event.shiftKey) {
        event.preventDefault();
        ui.toggleLeft();
        return;
      }

      if (key === 'b' && event.shiftKey) {
        event.preventDefault();
        ui.toggleRight();
        return;
      }

      if (key === 'j') {
        event.preventDefault();
        ui.toggleBottom();
        return;
      }
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, []);
}