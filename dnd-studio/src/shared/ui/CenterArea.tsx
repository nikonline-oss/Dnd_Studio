import { useEffect, useRef } from 'react';

import { useActiveCampaign, useActiveScene } from '../api/hooks';
import { StartScreen } from '../../features/campaign-start/StartScreen';
import { JournalTab } from '../../features/journal/JournalTab';
import { CharacterTab } from '../../features/character/CharacterTab';
import { MapTab } from '../../features/map/MapTab';
import { logDebug } from '../lib/debug';
import { useWorkspaceStore } from '../stores/workspace';
import { CompendiumTab } from '../../features/compendium/CompendiumTab';
import { usePlayerVisibility } from '../../shared/hooks/usePlayerVisibility';
import { WaitingForGM } from '../../features/multiplayer/WaitingForGM';
import { useMaps } from '../../shared/api/hooks';

import { WorkspaceTabBar } from './WorkspaceTabBar';

function WorkspaceEmpty() {
  return (
    <div className="workspace-empty">
      <div className="workspace-placeholder">
        <h2>Workspace</h2>
        <p>Open a map from the Navigator panel.</p>
      </div>
    </div>
  );
}

function ActiveTabContent() {
  const tabs = useWorkspaceStore((state) => state.tabs);
  const activeTabId = useWorkspaceStore((state) => state.activeTabId);
  const activeCampaign = useActiveCampaign();

  const { data: maps = [] } = useMaps(Boolean(activeCampaign));
  const { canSeeMap, isGM } = usePlayerVisibility();

  const visibleMaps = maps.filter(canSeeMap);

  const activeTab = tabs.find((tab) => tab.id === activeTabId);

  if (!activeTab) {
    return <WorkspaceEmpty />;
  }
  if (!isGM && visibleMaps.length === 0 && tabs.length === 0) {
    return <WaitingForGM />;
  }

  if (activeTab.kind === 'map') {
    return <MapTab mapId={activeTab.entityId} />;
  }

  if (activeTab.kind === 'journal') {
    return <JournalTab entryId={activeTab.entityId} />;
  }

  if (activeTab.kind === 'character') {
    return <CharacterTab characterId={activeTab.entityId} />;
  }

  if (activeTab.kind === 'compendium') {
    return <CompendiumTab compendiumId={activeTab.entityId} />;
  }

  return (
    <div className="workspace-empty">
      This tab type will be implemented later.
    </div>
  );
}

export function CenterArea() {
  const { data: activeCampaign, isLoading } = useActiveCampaign();

  const bindCampaign = useWorkspaceStore((state) => state.bindCampaign);
  const lastCampaignId = useWorkspaceStore((state) => state.lastCampaignId);
  const setLastCampaignId = useWorkspaceStore(
    (state) => state.setLastCampaignId,
  );
  const { data: maps = [] } = useMaps(Boolean(activeCampaign));
  const { data: activeSceneId } = useActiveScene(Boolean(activeCampaign));
  const { isGM, isLocalMode, canSeeMap } = usePlayerVisibility();

  const openTab = useWorkspaceStore((state) => state.openTab);

  const previousActiveCampaignIdRef = useRef<string | null>(null);


  useEffect(() => {
    const currentActiveCampaignId = activeCampaign?.id ?? null;

    logDebug('center', 'session sync effect', {
      isLoading,
      currentActiveCampaignId,
      lastCampaignId,
      previousActiveCampaignId: previousActiveCampaignIdRef.current,
    });

    if (isLoading) {
      return;
    }

    if (currentActiveCampaignId) {
      // Сохраняем lastCampaignId только когда активная кампания реально сменилась.
      // Это важно, чтобы не восстановить lastCampaignId обратно во время
      // закрытия кампании через кнопку Switch campaign.
      if (previousActiveCampaignIdRef.current !== currentActiveCampaignId) {
        logDebug(
          'center',
          'new active campaign detected, saving lastCampaignId',
          currentActiveCampaignId,
        );

        setLastCampaignId(currentActiveCampaignId);
      }

      previousActiveCampaignIdRef.current = currentActiveCampaignId;

      bindCampaign(currentActiveCampaignId);
      return;
    }

    previousActiveCampaignIdRef.current = null;

    if (!lastCampaignId) {
      logDebug(
        'center',
        'no active campaign and no last campaign, resetting workspace',
      );

      bindCampaign(null);
      return;
    }

    logDebug(
      'center',
      'no active campaign yet, but lastCampaignId exists, waiting for restore',
      {
        lastCampaignId,
      },
    );
  }, [
    activeCampaign?.id,
    isLoading,
    lastCampaignId,
    bindCampaign,
    setLastCampaignId,
  ]);

  useEffect(() => {
    if (isGM || isLocalMode) return;
    if (!activeSceneId) return;

    const sceneMap = maps.find((m) => m.id === activeSceneId);

    if (sceneMap && sceneMap.isVisibleToPlayers) {
      // Открываем вкладку карты если ещё не открыта
      const tabId = `map:${sceneMap.id}`;
      openTab({
        id: tabId,
        kind: 'map',
        title: sceneMap.name,
        entityId: sceneMap.id,
      });
    }
  }, [activeSceneId, maps, isGM, isLocalMode, openTab]);

  if (isLoading) {
    return (
      <main className="center-area">
        <div className="empty-state">Loading workspace…</div>
      </main>
    );
  }

  if (!activeCampaign) {
    return (
      <main className="center-area">
        <StartScreen />
      </main>
    );
  }

  return (
    <main className="center-area workspace-center">
      <div className="workspace-shell">
        <WorkspaceTabBar />

        <div className="workspace-content">
          <ActiveTabContent />
        </div>
      </div>
    </main>
  );
}