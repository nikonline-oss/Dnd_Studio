import { useActiveCampaign } from '../api/hooks';

export function StatusBar() {
  const { data: activeCampaign } = useActiveCampaign();

  return (
    <footer className="statusbar">
      <div className="statusbar-left">
        <span>🎲 {activeCampaign ? activeCampaign.name : 'No campaign'}</span>
      </div>

      <div className="statusbar-center">
        <span>🟢 Offline</span>
      </div>

      <div className="statusbar-right">
        <span>🔌 0 plugins</span>
        <span>v0.1.0</span>
      </div>
    </footer>
  );
}