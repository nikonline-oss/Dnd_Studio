import { useActiveCampaign } from '../api/hooks';
import { StartScreen } from '../../features/campaign-start/StartScreen';

export function CenterArea() {
  const { data: activeCampaign, isLoading } = useActiveCampaign();

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
    <main className="center-area">
      <div className="workspace-placeholder">
        <h2>{activeCampaign.name}</h2>
        <p>Workspace is ready for Stage 2: map, tokens, chat and journal.</p>
        <code>{activeCampaign.path}</code>
      </div>
    </main>
  );
}