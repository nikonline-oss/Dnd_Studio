import { useMemo } from 'react';

import { useUiStore } from '../stores/ui';
import type { MapSummary, TokenSummary, JournalEntrySummary } from '../api/bindings';

/** Пороги качественных HP (настраиваемые в будущем) */
const HP_THRESHOLDS = {
  healthy: 0.75,   // > 75%
  wounded: 0.25,   // > 25%
  critical: 0,     // > 0%
};

/** Качественное состояние HP */
export type HpQuality = 'healthy' | 'wounded' | 'critical' | 'dead';

/** Цвета для качественных HP */
export const HP_COLORS: Record<HpQuality, string> = {
  healthy: '#66bb6a',
  wounded: '#ffa726',
  critical: '#ef5350',
  dead: '#757575',
};

/**
 * Хук для определения видимости элементов по роли пользователя.
 * GM видит всё, Player — только разрешённое.
 */
export function usePlayerVisibility() {
  const userRole = useUiStore((state) => state.userRole);
  const connectionStatus = useUiStore((state) => state.connectionStatus);

  return useMemo(() => {
    // В локальном режиме (без подключения) — все действия разрешены
    const isLocalMode = connectionStatus !== 'connected';
    const isGM = isLocalMode || userRole === 'gm' || userRole === 'co_gm';
    const isSpectator = !isLocalMode && userRole === 'spectator';

    /** Может ли пользователь видеть карту */
    const canSeeMap = (map: MapSummary): boolean => {
      if (isGM) return true;
      return map.isVisibleToPlayers;
    };

    /** Может ли пользователь видеть токен */
    const canSeeToken = (token: TokenSummary): boolean => {
      if (isGM) return true;
      return token.isVisible;
    };

    /** Может ли пользователь видеть запись журнала */
    const canSeeJournalEntry = (entry: JournalEntrySummary): boolean => {
      if (isGM) return true;
      return entry.visibility === 'players' || entry.visibility === 'public';
    };

    /** Может ли пользователь редактировать запись журнала */
    const canEditJournalEntry = (entry: JournalEntrySummary): boolean => {
      if (isGM) return true;
      return entry.playersCanEdit;
    };

    /** Может ли пользователь двигать токен */
    const canMoveToken = (tokenId: string, ownerId: string | null): boolean => {
      if (isGM) return true;
      if (isSpectator) return false;
      // Player может двигать только свои токены
      // ownerId определяется через token_owners на сервере
      // Для MVP: GM решает через назначение владельца
      return true; // Упрощённо для MVP
    };

    /** Форматирует HP: точные цифры для GM, качественные для Player */
    const formatHP = (
      current: number,
      max: number,
      isMonster: boolean = false,
    ): string => {
      if (isGM || !isMonster) {
        return `${current}/${max}`;
      }

      const quality = getHpQuality(current, max);

      switch (quality) {
        case 'healthy':
          return 'Healthy';
        case 'wounded':
          return 'Wounded';
        case 'critical':
          return 'Critical';
        case 'dead':
          return 'Dead';
      }
    };

    /** Возвращает цвет для качественного HP */
    const getHpColor = (current: number, max: number): string => {
      const quality = getHpQuality(current, max);
      return HP_COLORS[quality];
    };

    return {
      isGM,
      isLocalMode,
      isSpectator,
      canSeeMap,
      canSeeToken,
      canSeeJournalEntry,
      canEditJournalEntry,
      canMoveToken,
      formatHP,
      getHpColor,
    };
  }, [userRole, connectionStatus]);
}

/** Определяет качественное состояние HP */
export function getHpQuality(current: number, max: number): HpQuality {
  if (current <= 0) return 'dead';

  const percent = current / max;

  if (percent > HP_THRESHOLDS.healthy) return 'healthy';
  if (percent > HP_THRESHOLDS.wounded) return 'wounded';
  return 'critical';
}