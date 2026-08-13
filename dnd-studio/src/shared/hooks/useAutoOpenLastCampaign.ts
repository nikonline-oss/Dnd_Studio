import { useEffect, useRef } from 'react';

import {
  useActiveCampaign,
  useCampaigns,
  useOpenCampaign,
} from '../api/hooks';
import { logDebug, logError } from '../lib/debug';
import { useWorkspaceStore } from '../stores/workspace';

export function useAutoOpenLastCampaign(enabled: boolean) {
  const { data: activeCampaign, isLoading: isActiveLoading } =
    useActiveCampaign();

  const { data: campaigns, isLoading: areCampaignsLoading } =
    useCampaigns();

  const lastCampaignId = useWorkspaceStore((state) => state.lastCampaignId);
  const clearLastCampaign = useWorkspaceStore(
    (state) => state.clearLastCampaign,
  );

  const openCampaign = useOpenCampaign();

  const attempted = useRef(false);

  useEffect(() => {
    if (!enabled) {
      logDebug('auto-open', 'disabled, workspace not hydrated yet');
      return;
    }

    if (attempted.current) {
      return;
    }

    logDebug('auto-open', 'checking session restore', {
      isActiveLoading,
      areCampaignsLoading,
      activeCampaignId: activeCampaign?.id ?? null,
      lastCampaignId,
      campaignsCount: campaigns?.length ?? 0,
    });

    if (isActiveLoading || areCampaignsLoading) {
      return;
    }

    attempted.current = true;

    if (activeCampaign) {
      logDebug('auto-open', 'campaign already active, nothing to restore');
      return;
    }

    if (!lastCampaignId) {
      logDebug('auto-open', 'no lastCampaignId, showing campaign picker');
      return;
    }

    const exists = campaigns?.some(
      (campaign) => campaign.id === lastCampaignId,
    );

    if (!exists) {
      logDebug(
        'auto-open',
        'lastCampaignId not found in campaign list, clearing',
        {
          lastCampaignId,
        },
      );

      clearLastCampaign();
      return;
    }

    logDebug('auto-open', 'opening last campaign', lastCampaignId);

    openCampaign.mutate(lastCampaignId, {
      onError: (error) => {
        logError('auto-open', 'failed to open last campaign', error);
        clearLastCampaign();
      },
    });
  }, [
    enabled,
    isActiveLoading,
    areCampaignsLoading,
    activeCampaign,
    campaigns,
    lastCampaignId,
    clearLastCampaign,
    openCampaign,
  ]);
}