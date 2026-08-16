import { useActiveCampaign } from '../api/hooks';
import { useUiStore } from '../stores/ui';

export function StatusBar() {
  const { data: activeCampaign } = useActiveCampaign();

  const connectionStatus = useUiStore((state) => state.connectionStatus);


  return (
    <footer className="statusbar">
      <div className="statusbar-left">
        <span>🎲 {activeCampaign ? activeCampaign.name : 'No campaign'}</span>
      </div>

      <div className="statusbar-center">
        <span className={`status-connection status-${connectionStatus}`}>
          {connectionStatus === 'connected' && '🟢 Connected'}
          {connectionStatus === 'connecting' && '🟡 Connecting…'}
          {connectionStatus === 'disconnected' && '⚪ Offline'}
          {connectionStatus === 'error' && '🔴 Error'}
        </span>
      </div>

      <div className="statusbar-right">
        <span>🔌 0 plugins</span>
        <span>v0.1.0</span>
      </div>
    </footer>
  );
}