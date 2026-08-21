import { create } from 'zustand';

export type DragKind = 'character';

export interface DragItem {
  kind: DragKind;
  id: string;
  name: string;
  icon?: string;
}

export interface DragPointer {
  x: number;
  y: number;
}

export interface DropTarget {
  kind: 'map' | 'map-canvas';
  id: string;
  worldX?: number;
  worldY?: number;
}

interface DragState {
  dragging: DragItem | null;
  pointer: DragPointer | null;
  activeTarget: DropTarget | null;
  previousTab: string | null; // <-- Добавляем

  startDrag: (item: DragItem) => void;
  updatePointer: (pointer: DragPointer) => void;
  setActiveTarget: (target: DropTarget | null) => void;
  endDrag: () => void;
  setPreviousTab: (tab: string) => void; // <-- Добавляем
  clearPreviousTab: () => void;           // <-- Добавляем
}

export const useDragStore = create<DragState>()((set) => ({
  dragging: null,
  pointer: null,
  activeTarget: null,
  previousTab: null, // <-- Инициализация

  startDrag: (dragging) =>
    set({
      dragging,
      pointer: null,
      activeTarget: null,
    }),

  updatePointer: (pointer) => set({ pointer }),

  setActiveTarget: (activeTarget) => set({ activeTarget }),

  endDrag: () =>
    set({
      dragging: null,
      pointer: null,
      activeTarget: null,
    }),

  setPreviousTab: (previousTab) => set({ previousTab }),
  clearPreviousTab: () => set({ previousTab: null }),
}));