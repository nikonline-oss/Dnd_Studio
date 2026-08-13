const DEBUG_STORAGE_KEY = 'dndstudio.debug';

function isDebugEnabled(): boolean {
  try {
    return (
      import.meta.env.DEV ||
      localStorage.getItem(DEBUG_STORAGE_KEY) === '1'
    );
  } catch {
    return false;
  }
}

function timestamp(): string {
  return new Date().toISOString().slice(11, 23);
}

export function logDebug(
  scope: string,
  message: string,
  payload?: unknown,
): void {
  if (!isDebugEnabled()) {
    return;
  }

  if (payload === undefined) {
    console.log(`[${timestamp()}][DndStudio:${scope}] ${message}`);
  } else {
    console.log(
      `[${timestamp()}][DndStudio:${scope}] ${message}`,
      payload,
    );
  }
}

export function logError(
  scope: string,
  message: string,
  payload?: unknown,
): void {
  if (payload === undefined) {
    console.error(`[${timestamp()}][DndStudio:${scope}] ${message}`);
  } else {
    console.error(
      `[${timestamp()}][DndStudio:${scope}] ${message}`,
      payload,
    );
  }
}