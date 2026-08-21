import { useCallback, useEffect, useRef, useState } from 'react';

import { useDragStore, type DragItem, type DropTarget } from '../stores/drag';

interface UseDropTargetOptions<TTarget extends DropTarget> {
  target: TTarget;
  accepts: (item: DragItem) => boolean;
  onDrop: (item: DragItem, target: TTarget) => void;
}

interface UseDropTargetResult {
  ref: React.RefCallback<HTMLElement>;
  isOver: boolean;
  isAccepting: boolean;
}

export function useDropTarget<TTarget extends DropTarget>({
  target,
  accepts,
  onDrop,
}: UseDropTargetOptions<TTarget>): UseDropTargetResult {
  const dragging = useDragStore((s) => s.dragging);
  const setActiveTarget = useDragStore((s) => s.setActiveTarget);

  const [isOver, setIsOver] = useState(false);
  const elementRef = useRef<HTMLElement | null>(null);

  const isAccepting = dragging !== null && accepts(dragging);

  // Обработчик drop события
  useEffect(() => {
    const handleDrop = (event: Event) => {
      const custom = event as CustomEvent<{
        item: DragItem;
        target: DropTarget;
        pointer: { x: number; y: number };
      }>;

      // Сравниваем по kind и id
      if (
        custom.detail.target.kind === target.kind &&
        custom.detail.target.id === target.id &&
        accepts(custom.detail.item)
      ) {
        onDrop(custom.detail.item, custom.detail.target as TTarget);
      }
    };

    window.addEventListener('dndstudio:drop', handleDrop);
    return () => window.removeEventListener('dndstudio:drop', handleDrop);
  }, [target, accepts, onDrop]);

  const ref = useCallback(
    (element: HTMLElement | null) => {
      if (elementRef.current) {
        elementRef.current.removeEventListener('pointerenter', handleEnter);
        elementRef.current.removeEventListener('pointerleave', handleLeave);
        // Очищаем data-атрибуты при размонтировании
        delete elementRef.current.dataset.dndKind;
        delete elementRef.current.dataset.dndId;
      }

      elementRef.current = element;

      if (!element) return;

      // Сохраняем данные прямо в DOM для elementFromPoint
      element.dataset.dndKind = target.kind;
      element.dataset.dndId = target.id;

      element.addEventListener('pointerenter', handleEnter);
      element.addEventListener('pointerleave', handleLeave);

      function handleEnter() {
        if (!dragging || !accepts(dragging)) return;
        setIsOver(true);
        setActiveTarget(target);
      }

      function handleLeave() {
        setIsOver(false);
        if (
          useDragStore.getState().activeTarget?.id === target.id &&
          useDragStore.getState().activeTarget?.kind === target.kind
        ) {
          setActiveTarget(null);
        }
      }
    },
    [dragging, accepts, target, setActiveTarget],
  );

  return { ref, isOver, isAccepting };
}