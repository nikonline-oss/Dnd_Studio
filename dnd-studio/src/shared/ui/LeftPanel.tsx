import { useUiStore } from '../stores/ui';

export function LeftPanel() {
  const activeLeftTab = useUiStore((state) => state.activeLeftTab);

  return (
    <aside className="panel left-panel" aria-label="Left panel content">
      <div className="panel-content">
        {activeLeftTab === 'navigator' && (
          <div className="empty-state">Campaign navigator will appear here.</div>
        )}

        {activeLeftTab === 'plugins' && (
          <div className="empty-state">Plugin browser will appear here.</div>
        )}

        {activeLeftTab === 'compendiums' && (
          <div className="empty-state">Compendiums will appear here.</div>
        )}
      </div>
    </aside>
  );
}