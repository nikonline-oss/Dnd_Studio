import { useEffect, useRef } from 'react';
import clsx from 'clsx';
import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
  type ImperativePanelHandle,
} from 'react-resizable-panels';

import { BottomPanel } from '../shared/ui/BottomPanel';
import { CenterArea } from '../shared/ui/CenterArea';
import { LeftActivityBar } from '../shared/ui/LeftActivityBar';
import { LeftPanel } from '../shared/ui/LeftPanel';
import { RightActivityBar } from '../shared/ui/RightActivityBar';
import { RightPanel } from '../shared/ui/RightPanel';
import { StatusBar } from '../shared/ui/StatusBar';
import { TopBar } from '../shared/ui/TopBar';

import { useUiStore } from '../shared/stores/ui';

export function AppShell() {
  const leftVisible = useUiStore((state) => state.leftVisible);
  const rightVisible = useUiStore((state) => state.rightVisible);
  const bottomVisible = useUiStore((state) => state.bottomVisible);

  const setLeftVisible = useUiStore((state) => state.setLeftVisible);
  const setRightVisible = useUiStore((state) => state.setRightVisible);
  const setBottomVisible = useUiStore((state) => state.setBottomVisible);

  const leftPanelRef = useRef<ImperativePanelHandle | null>(null);
  const rightPanelRef = useRef<ImperativePanelHandle | null>(null);
  const bottomPanelRef = useRef<ImperativePanelHandle | null>(null);

  useEffect(() => {
    const panel = leftPanelRef.current;

    if (!panel) {
      return;
    }

    if (leftVisible) {
      if (panel.isCollapsed()) {
        panel.expand();
      }
    } else {
      if (!panel.isCollapsed()) {
        panel.collapse();
      }
    }
  }, [leftVisible]);

  useEffect(() => {
    const panel = rightPanelRef.current;

    if (!panel) {
      return;
    }

    if (rightVisible) {
      if (panel.isCollapsed()) {
        panel.expand();
      }
    } else {
      if (!panel.isCollapsed()) {
        panel.collapse();
      }
    }
  }, [rightVisible]);

  useEffect(() => {
    const panel = bottomPanelRef.current;

    if (!panel) {
      return;
    }

    if (bottomVisible) {
      if (panel.isCollapsed()) {
        panel.expand();
      }
    } else {
      if (!panel.isCollapsed()) {
        panel.collapse();
      }
    }
  }, [bottomVisible]);

  return (
    <div className="app-shell">
      <TopBar />

      <div className="app-body">
        <LeftActivityBar />

        <PanelGroup
          direction="horizontal"
          autoSaveId="dndstudio.layout.main.v2"
          className="main-panels"
        >
          <Panel
            ref={leftPanelRef}
            id="left"
            order={1}
            defaultSize={18}
            minSize={12}
            maxSize={32}
            collapsible
            collapsedSize={0}
            onCollapse={() => {
              if (useUiStore.getState().leftVisible) {
                setLeftVisible(false);
              }
            }}
            onExpand={() => {
              if (!useUiStore.getState().leftVisible) {
                setLeftVisible(true);
              }
            }}
          >
            <LeftPanel />
          </Panel>

          <PanelResizeHandle
            disabled={!leftVisible}
            className={clsx(
              'resize-handle',
              'resize-handle-horizontal',
              {
                'resize-handle-hidden': !leftVisible,
              },
            )}
          />

          <Panel
            id="center-wrapper"
            order={2}
            minSize={35}
          >
            <PanelGroup
              direction="vertical"
              autoSaveId="dndstudio.layout.center.v2"
            >
              <Panel
                id="center"
                order={1}
                minSize={30}
              >
                <CenterArea />
              </Panel>

              <PanelResizeHandle
                disabled={!bottomVisible}
                className={clsx(
                  'resize-handle',
                  'resize-handle-vertical',
                  {
                    'resize-handle-hidden': !bottomVisible,
                  },
                )}
              />

              <Panel
                ref={bottomPanelRef}
                id="bottom"
                order={2}
                defaultSize={28}
                minSize={12}
                collapsible
                collapsedSize={0}
                onCollapse={() => {
                  if (useUiStore.getState().bottomVisible) {
                    setBottomVisible(false);
                  }
                }}
                onExpand={() => {
                  if (!useUiStore.getState().bottomVisible) {
                    setBottomVisible(true);
                  }
                }}
              >
                <BottomPanel />
              </Panel>
            </PanelGroup>
          </Panel>

          <PanelResizeHandle
            disabled={!rightVisible}
            className={clsx(
              'resize-handle',
              'resize-handle-horizontal',
              {
                'resize-handle-hidden': !rightVisible,
              },
            )}
          />

          <Panel
            ref={rightPanelRef}
            id="right"
            order={3}
            defaultSize={18}
            minSize={12}
            maxSize={32}
            collapsible
            collapsedSize={0}
            onCollapse={() => {
              if (useUiStore.getState().rightVisible) {
                setRightVisible(false);
              }
            }}
            onExpand={() => {
              if (!useUiStore.getState().rightVisible) {
                setRightVisible(true);
              }
            }}
          >
            <RightPanel />
          </Panel>
        </PanelGroup>

        <RightActivityBar />
      </div>

      <StatusBar />
    </div>
  );
}