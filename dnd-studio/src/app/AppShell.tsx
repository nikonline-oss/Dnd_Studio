import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { BottomPanel } from '../shared/ui/BottomPanel';
import { CenterArea } from '../shared/ui/CenterArea';
import { LeftPanel } from '../shared/ui/LeftPanel';
import { RightPanel } from '../shared/ui/RightPanel';
import { StatusBar } from '../shared/ui/StatusBar';
import { TopBar } from '../shared/ui/TopBar';
import { useUiStore } from '../shared/stores/ui';

export function AppShell() {
  const leftVisible = useUiStore((state) => state.leftVisible);
  const rightVisible = useUiStore((state) => state.rightVisible);
  const bottomVisible = useUiStore((state) => state.bottomVisible);

  return (
    <div className="app-shell">
      <TopBar />

      <div className="app-body">
        <PanelGroup direction="horizontal" autoSaveId="dndstudio.layout.main">
          {leftVisible && (
            <>
              <Panel id="left" defaultSize={18} minSize={12} maxSize={32}>
                <LeftPanel />
              </Panel>
              <PanelResizeHandle className="resize-handle resize-handle-horizontal" />
            </>
          )}

          <Panel id="center-wrapper" minSize={35}>
            <PanelGroup direction="vertical" autoSaveId="dndstudio.layout.center">
              <Panel id="center" minSize={30}>
                <CenterArea />
              </Panel>

              {bottomVisible && (
                <>
                  <PanelResizeHandle className="resize-handle resize-handle-vertical" />
                  <Panel id="bottom" defaultSize={28} minSize={12}>
                    <BottomPanel />
                  </Panel>
                </>
              )}
            </PanelGroup>
          </Panel>

          {rightVisible && (
            <>
              <PanelResizeHandle className="resize-handle resize-handle-horizontal" />
              <Panel id="right" defaultSize={18} minSize={12} maxSize={32}>
                <RightPanel />
              </Panel>
            </>
          )}
        </PanelGroup>
      </div>

      <StatusBar />
    </div>
  );
}