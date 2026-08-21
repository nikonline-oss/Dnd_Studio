import { useEffect, useRef } from 'react';

export interface Shortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  handler: () => void;
  /** Если true — shortcut срабатывает даже в input/textarea */
  global?: boolean;
  /** Описание для UI (отображается в меню) */
  label?: string;
}

/**
 * Регистрирует глобальные keyboard shortcuts.
 * Автоматически отписывается при unmount.
 */
export function useKeyboardShortcuts(shortcuts: Shortcut[]) {
  const shortcutsRef = useRef(shortcuts);
  shortcutsRef.current = shortcuts;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isEditable =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      for (const shortcut of shortcutsRef.current) {
        const ctrlMatch = shortcut.ctrl
          ? e.ctrlKey || e.metaKey
          : !e.ctrlKey && !e.metaKey;
        const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey;
        const altMatch = shortcut.alt ? e.altKey : !e.altKey;

        // Используем event.code вместо event.key — он не зависит от раскладки
        if (
          e.code === shortcut.key &&
          ctrlMatch &&
          shiftMatch &&
          altMatch
        ) {
          // Пропускаем shortcut если фокус в input, кроме global
          if (isEditable && !shortcut.global) {
            continue;
          }

          e.preventDefault();
          e.stopPropagation();
          shortcut.handler();
          return;
        }
      }
    };

    // capture: true — слушаем раньше других обработчиков
    // passive: false — позволяем вызывать preventDefault/stopPropagation
    window.addEventListener('keydown', handleKeyDown, {
      capture: true,
      passive: false,
    });
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, []);
}

/** Форматирует shortcut для отображения в меню */
export function formatShortcut(shortcut: Omit<Shortcut, 'handler' | 'label'>): string {
  const parts: string[] = [];

  const isMac = navigator.platform.toLowerCase().includes('mac');
  const mod = isMac ? '⌘' : 'Ctrl';

  if (shortcut.ctrl) parts.push(mod);
  if (shortcut.shift) parts.push(isMac ? '⇧' : 'Shift');
  if (shortcut.alt) parts.push(isMac ? '⌥' : 'Alt');

  // Извлекаем букву из формата "KeyN" → "N", "KeyB" → "B"
  let keyLabel = shortcut.key;

  const keyMap: Record<string, string> = {
    ArrowUp: '↑',
    ArrowDown: '↓',
    ArrowLeft: '←',
    ArrowRight: '→',
    Escape: 'Esc',
    Enter: '↵',
    Backspace: '⌫',
    Delete: 'Del',
    Space: 'Space',
  };

  if (keyMap[keyLabel]) {
    keyLabel = keyMap[keyLabel];
  } else if (keyLabel.startsWith('Key')) {
    keyLabel = keyLabel.slice(3);
  } else if (keyLabel.startsWith('Digit')) {
    keyLabel = keyLabel.slice(5);
  } else if (keyLabel.startsWith('Numpad')) {
    keyLabel = keyLabel.slice(6);
  }

  parts.push(keyLabel);

  return parts.join(isMac ? '' : '+');
}
