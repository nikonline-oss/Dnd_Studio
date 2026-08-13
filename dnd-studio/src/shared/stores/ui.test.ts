import { beforeEach, describe, expect, it } from 'vitest';
import { useUiStore } from './ui';

describe('ui store', () => {
  beforeEach(() => {
    useUiStore.setState({
      themeMode: 'system',
      leftVisible: true,
      rightVisible: true,
      bottomVisible: true,
      activeLeftTab: 'navigator',
      activeRightTab: 'inspector',
      activeBottomTab: 'chat',
    });
  });

  it('toggles left panel', () => {
    useUiStore.getState().toggleLeft();
    expect(useUiStore.getState().leftVisible).toBe(false);

    useUiStore.getState().toggleLeft();
    expect(useUiStore.getState().leftVisible).toBe(true);
  });

  it('toggles right panel', () => {
    useUiStore.getState().toggleRight();
    expect(useUiStore.getState().rightVisible).toBe(false);
  });

  it('toggles bottom panel', () => {
    useUiStore.getState().toggleBottom();
    expect(useUiStore.getState().bottomVisible).toBe(false);
  });

  it('changes theme mode', () => {
    useUiStore.getState().setThemeMode('dark');
    expect(useUiStore.getState().themeMode).toBe('dark');
  });
});