import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { AppShell } from './app/AppShell';
import { useUiStore } from './shared/stores/ui';
import { applyThemeMode } from './shared/theme/theme';

import './styles/global.css';

applyThemeMode(useUiStore.getState().themeMode);

useUiStore.persist.onFinishHydration(() => {
  applyThemeMode(useUiStore.getState().themeMode);
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AppShell />
    </QueryClientProvider>
  </React.StrictMode>,
);