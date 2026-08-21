import { useCallback } from 'react';

import { useDragStore, type DragItem } from '../stores/drag';

interface UseDraggableOptions {
  item: DragItem;
  disabled?: boolean;
}

interface UseDraggableResult {
  handlers: {
    onPointerDown: (e: React.PointerEvent) => void;
  };
  isDragging: boolean;
}

export function useDraggable({
  item,
  disabled = false,
}: UseDraggableOptions): UseDraggableResult {
  const startDrag = useDragStore((s) => s.startDrag);
  const updatePointer = useDragStore((s) => s.updatePointer);
  const endDrag = useDragStore((s) => s.endDrag);
  const dragging = useDragStore((s) => s.dragging);

  const isDragging = dragging?.id === item.id && dragging?.kind === item.kind;

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (disabled) return;
      if (e.button !== 0) return; // Только ЛКМ

      e.preventDefault();
      e.stopPropagation();

      const startX = e.clientX;
      const startY = e.clientY;
      let started = false;

      const handlePointerMove = (ev: PointerEvent) => {
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;

        if (!started && dx * dx + dy * dy < 25) {
          // Меньше 5px движения — ещё не drag
          return;
        }

        if (!started) {
          started = true;
          startDrag(item);
        }

        updatePointer({ x: ev.clientX, y: ev.clientY });
      };

      const handlePointerUp = (ev: PointerEvent) => {
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);

        if (!started) {
          return; // Это был обычный клик
        }

        // НАДЕЖНЫЙ СПОСОБ: ищем элемент под курсором в момент отпускания
        // Скрываем drag-overlay на мгновение, чтобы elementFromPoint не попал в него
        const overlay = document.querySelector('.drag-overlay') as HTMLElement;
        const wasHidden = overlay ? overlay.style.display === 'none' : false;
        
        if (overlay) overlay.style.display = 'none';
        
        const dropElement = document.elementFromPoint(ev.clientX, ev.clientY);
        
        if (overlay && !wasHidden) overlay.style.display = ''; // Возвращаем как было

        if (dropElement) {
          // Ищем ближайший родительский элемент с нашими data-атрибутами
          // (на случай, если курсор оказался над иконкой или текстом внутри drop-зоны)
          const targetElement = dropElement.closest('[data-dnd-kind]') as HTMLElement | null;

          if (targetElement) {
            const kind = targetElement.dataset.dndKind as 'map' | 'map-canvas';
            const id = targetElement.dataset.dndId;

            if (kind && id) {
              window.dispatchEvent(
                new CustomEvent('dndstudio:drop', {
                  detail: {
                    item,
                    target: { kind, id },
                    pointer: { x: ev.clientX, y: ev.clientY },
                  },
                })
              );
            }
          }
        }

        endDrag();
      };

      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    },
    [disabled, item, startDrag, updatePointer, endDrag],
  );

  return {
    handlers: { onPointerDown: handlePointerDown },
    isDragging,
  };
}