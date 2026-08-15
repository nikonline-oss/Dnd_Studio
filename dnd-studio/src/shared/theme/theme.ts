export type ThemeMode = 'system' | 'light' | 'dark' | 'plugin';
export type ResolvedTheme = 'light' | 'dark';

export function resolveTheme(mode: ThemeMode): ResolvedTheme {
  if (mode === 'light') {
    return 'light';
  }

  if (mode === 'dark') {
    return 'dark';
  }

  if (typeof window === 'undefined') {
    return 'dark';
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

export function applyThemeMode(mode: ThemeMode): void {
  const resolved = resolveTheme(mode);

  const root = document.documentElement;

  root.setAttribute('data-theme', resolved);
  root.style.colorScheme = resolved;
}