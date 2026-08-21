import { useDragStore } from '../stores/drag';

export function DragOverlay() {
  const dragging = useDragStore((s) => s.dragging);
  const pointer = useDragStore((s) => s.pointer);
  const activeTarget = useDragStore((s) => s.activeTarget);

  if (!dragging || !pointer) return null;

  return (
    <div
      className="drag-overlay"
      style={{
        left: pointer.x + 16,
        top: pointer.y + 16,
      }}
    >
      <span className="drag-overlay-icon">{dragging.icon ?? '👤'}</span>
      <span className="drag-overlay-name">{dragging.name}</span>
      {activeTarget && <span className="drag-overlay-badge">Drop!</span>}
    </div>
  );
}