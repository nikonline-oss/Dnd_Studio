import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { commands, TokenSummary } from './bindings';
import { useWorkspaceStore } from '../stores/workspace';
import { logError } from '../lib/debug';

async function unwrap<T, E extends { kind: string; message?: string }>(
  promise: Promise<{ status: "ok"; data: T } | { status: "error"; error: E }>
): Promise<T> {
  const result = await promise;

  if (result.status === "ok") {
    return result.data;
  }

  const error = result.error;
  const message = 'message' in error ? error.message : 'Unknown error';

  throw new Error(`[${error.kind}] ${message}`);
}

export function useCampaigns() {
  return useQuery({
    queryKey: ['campaigns'],
    queryFn: () => unwrap(commands.listCampaigns()),
  });
}

export function useActiveCampaign() {
  return useQuery({
    queryKey: ['activeCampaign'],
    queryFn: () => unwrap(commands.getActiveCampaign()),
    retry: false,
  });
}

export function useCreateCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => unwrap(commands.createCampaign(name)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['activeCampaign'] });
    },
    onError: (error: Error) => {
      console.error('Failed to create campaign:', error.message);
    },
  });
}

export function useOpenCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => unwrap(commands.openCampaign(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['activeCampaign'] });
    },
    onError: (error: Error) => {
      console.error('Failed to open campaign:', error.message);
    },
  });
}

export function useCloseCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => unwrap(commands.closeCampaign()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeCampaign'] });
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['maps'] });

      useWorkspaceStore.getState().clearLastCampaign();
    },
  });
}

export function useMaps(enabled: boolean) {
  return useQuery({
    queryKey: ['maps'],
    queryFn: () => unwrap(commands.listMaps()),
    enabled,
    retry: false,
  });
}

export function useMap(id?: string) {
  return useQuery({
    queryKey: ['map', id],
    queryFn: () => unwrap(commands.getMap(id!)),
    enabled: Boolean(id),
    retry: false,
  });
}

export function useCreateMap() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ name, width, height, grid_size }: { name: string; width: number; height: number; grid_size: number }) => unwrap(commands.createMap(name, width, height, grid_size)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maps'] });
    },
  });
}


export function useTokens(mapId?: string) {
  return useQuery({
    queryKey: ['tokens', mapId],
    queryFn: () => unwrap(commands.listTokens(mapId!)),
    enabled: Boolean(mapId),
    retry: false,
  });
}

type CreateTokenVars = {
  mapId: string;
  x: number;
  y: number;
  characterId?: string | null;
};

type MoveTokenVars = {
  mapId: string;
  tokenId: string;
  x: number;
  y: number;
};

type DeleteTokenVars = {
  mapId: string;
  tokenId: string;
};

type TokenMutationContext = {
  previous?: TokenSummary[];
};

export function useCreateToken() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ mapId, x, y, characterId }: CreateTokenVars) =>
      unwrap(commands.createToken(mapId, x, y, characterId ?? null)),

    onSuccess: (data, variables) => {
      queryClient.setQueryData<TokenSummary[]>(
        ['tokens', variables.mapId],
        (old = []) => [...old, data],
      );
    },

    onError: (error) => {
      logError('api', 'create token failed', error);
    },

    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['tokens', variables.mapId],
      });
    },
  });
}

export function useMoveToken() {
  const queryClient = useQueryClient();

  return useMutation<
    unknown,
    Error,
    MoveTokenVars,
    TokenMutationContext
  >({
    mutationFn: ({ tokenId, x, y }: MoveTokenVars) =>
      unwrap(commands.moveToken(tokenId, x, y)),

    onMutate: async (variables) => {
      await queryClient.cancelQueries({
        queryKey: ['tokens', variables.mapId],
      });

      const previous = queryClient.getQueryData<TokenSummary[]>([
        'tokens',
        variables.mapId,
      ]);

      queryClient.setQueryData<TokenSummary[]>(
        ['tokens', variables.mapId],
        (old = []) =>
          old.map((token) =>
            token.id === variables.tokenId
              ? {
                ...token,
                x: variables.x,
                y: variables.y,
              }
              : token,
          ),
      );

      return { previous };
    },

    onError: (error, variables, context) => {
      logError('api', 'move token failed', error);

      if (context?.previous) {
        queryClient.setQueryData<TokenSummary[]>(
          ['tokens', variables.mapId],
          context.previous,
        );
      }
    },

    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['tokens', variables.mapId],
      });
    },
  });
}

export function useDeleteToken() {
  const queryClient = useQueryClient();

  return useMutation<
    unknown,
    Error,
    DeleteTokenVars,
    TokenMutationContext
  >({
    mutationFn: ({ tokenId }: DeleteTokenVars) =>
      unwrap(commands.deleteToken(tokenId)),

    onMutate: async (variables) => {
      await queryClient.cancelQueries({
        queryKey: ['tokens', variables.mapId],
      });

      const previous = queryClient.getQueryData<TokenSummary[]>([
        'tokens',
        variables.mapId,
      ]);

      queryClient.setQueryData<TokenSummary[]>(
        ['tokens', variables.mapId],
        (old = []) =>
          old.filter((token) => token.id !== variables.tokenId),
      );

      return { previous };
    },

    onError: (error, variables, context) => {
      logError('api', 'delete token failed', error);

      if (context?.previous) {
        queryClient.setQueryData<TokenSummary[]>(
          ['tokens', variables.mapId],
          context.previous,
        );
      }
    },

    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['tokens', variables.mapId],
      });
    },
  });
}

export function useCharacters(enabled: boolean = true) {
  return useQuery({
    queryKey: ['characters'],
    queryFn: () => unwrap(commands.listCharacters()),
    enabled,
    retry: false,
  });
}

export function useCreateCharacter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      name,
      characterType,
    }: {
      name: string;
      characterType: 'pc' | 'npc' | 'monster';
    }) => unwrap(commands.createCharacter(name, characterType)),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['characters'] });
    },

    onError: (error) => {
      logError('api', 'create character failed', error);
    },
  });
}


export function useJournalEntries(enabled: boolean = true) {
  return useQuery({
    queryKey: ['journalEntries'],
    queryFn: () => unwrap(commands.listJournalEntries()),
    enabled,
    retry: false,
  });
}

export function useJournalEntry(id?: string) {
  return useQuery({
    queryKey: ['journalEntry', id],
    queryFn: () => unwrap(commands.getJournalEntry(id!)),
    enabled: Boolean(id),
    retry: false,
  });
}

export function useCreateJournalEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      title,
      folderPath,
    }: {
      title: string;
      folderPath: string;
    }) => unwrap(commands.createJournalEntry(title, folderPath)),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journalEntries'] });
    },

    onError: (error) => {
      logError('api', 'create journal entry failed', error);
    },
  });
}

export function useUpdateJournalEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      title,
      contentMarkdown,
      folderPath,
      isVisibleToPlayers,
    }: {
      id: string;
      title: string;
      contentMarkdown: string;
      folderPath: string;
      isVisibleToPlayers: boolean;
    }) =>
      unwrap(
        commands.updateJournalEntry(
          id,
          title,
          contentMarkdown,
          folderPath,
          isVisibleToPlayers,
        ),
      ),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['journalEntries'] });
      queryClient.invalidateQueries({
        queryKey: ['journalEntry', variables.id],
      });
    },

    onError: (error) => {
      logError('api', 'update journal entry failed', error);
    },
  });
}

export function useDeleteJournalEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: string }) =>
      unwrap(commands.deleteJournalEntry(id)),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['journalEntries'] });
      queryClient.removeQueries({
        queryKey: ['journalEntry', variables.id],
      });
    },

    onError: (error) => {
      logError('api', 'delete journal entry failed', error);
    },
  });
}

export function useCharacter(id?: string) {
  return useQuery({
    queryKey: ['character', id],
    queryFn: () => unwrap(commands.getCharacter(id!)),
    enabled: Boolean(id),
    retry: false,
  });
}

export function useUpdateCharacter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      name,
      characterType,
      dataJson,
    }: {
      id: string;
      name: string;
      characterType: 'pc' | 'npc' | 'monster';
      dataJson: string;
    }) =>
      unwrap(
        commands.updateCharacter(id, name, characterType, dataJson),
      ),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['characters'] });
      queryClient.invalidateQueries({
        queryKey: ['character', variables.id],
      });

      queryClient.invalidateQueries({ queryKey: ['tokens'] });
    },

    onError: (error) => {
      logError('api', 'update character failed', error);
    },
  });
}

export async function readCampaignAssetDataUrl(
  relativePath: string,
): Promise<string> {
  return unwrap(commands.readCampaignAssetDataUrl(relativePath));
}

export function useImportMapImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      mapId,
      sourcePath,
    }: {
      mapId: string;
      sourcePath: string;
    }) => unwrap(commands.importMapImage(mapId, sourcePath)),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['map', variables.mapId],
      });

      queryClient.invalidateQueries({
        queryKey: ['maps'],
      });
    },

    onError: (error) => {
      logError('api', 'import map image failed', error);
    },
  });
}

export function useAssignTokenCharacter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      tokenId,
      characterId,
    }: {
      mapId: string;
      tokenId: string;
      characterId: string | null;
    }) => unwrap(commands.assignTokenCharacter(tokenId, characterId)),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['tokens', variables.mapId],
      });

      queryClient.invalidateQueries({
        queryKey: ['characters'],
      });
    },

    onError: (error) => {
      logError('api', 'assign token character failed', error);
    },
  });
}

export function useUpdateMapFog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      mapId,
      fogData,
    }: {
      mapId: string;
      fogData: string | null;
    }) => unwrap(commands.updateMapFog(mapId, fogData)),

    onSuccess: (_data, variables) => {
      // Обновляем кэш карты, чтобы при переключении вкладок туман не пропадал
      queryClient.setQueryData(['map', variables.mapId], (old: any) => {
        if (!old) return old;
        return { ...old, fogData: variables.fogData };
      });
    },

    onError: (error) => {
      logError('api', 'update map fog failed', error);
    },
  });
}

export async function getCharacterDetail(id: string) {
  return unwrap(commands.getCharacter(id));
}

export function useCompendiums(enabled: boolean = true) {
  return useQuery({
    queryKey: ['compendiums'],
    queryFn: () => unwrap(commands.listCompendiums()),
    enabled,
    retry: false,
  });
}

export function useCompendiumEntries(compendiumId?: string) {
  return useQuery({
    queryKey: ['compendiumEntries', compendiumId],
    queryFn: () => unwrap(commands.listCompendiumEntries(compendiumId!)),
    enabled: Boolean(compendiumId),
    retry: false,
  });
}

export function useCreateCompendium() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      name,
      compendiumType,
    }: {
      name: string;
      compendiumType: string;
    }) => unwrap(commands.createCompendium(name, compendiumType)),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compendiums'] });
    },

    onError: (error) => {
      logError('api', 'create compendium failed', error);
    },
  });
}

export function useCreateCompendiumEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      compendiumId,
      entryKey,
      name,
      dataJson,
    }: {
      compendiumId: string;
      entryKey: string;
      name: string;
      dataJson: string;
    }) =>
      unwrap(
        commands.createCompendiumEntry(compendiumId, entryKey, name, dataJson),
      ),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['compendiumEntries', variables.compendiumId],
      });
    },

    onError: (error) => {
      logError('api', 'create compendium entry failed', error);
    },
  });
}

export function useUpdateCompendium() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      name,
      compendiumType,
    }: {
      id: string;
      name: string;
      compendiumType: string;
    }) => unwrap(commands.updateCompendium(id, name, compendiumType)),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compendiums'] });
    },

    onError: (error) => {
      logError('api', 'update compendium failed', error);
    },
  });
}

export function useDeleteCompendium() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: string }) =>
      unwrap(commands.deleteCompendium(id)),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compendiums'] });
    },

    onError: (error) => {
      logError('api', 'delete compendium failed', error);
    },
  });
}

export function useUpdateCompendiumEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      name,
      dataJson,
    }: {
      id: string;
      name: string;
      dataJson: string;
    }) => unwrap(commands.updateCompendiumEntry(id, name, dataJson)),

    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['compendiumEntries', data.compendiumId],
      });
    },

    onError: (error) => {
      logError('api', 'update compendium entry failed', error);
    },
  });
}

export function useDeleteCompendiumEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, compendiumId }: { id: string; compendiumId: string }) =>
      unwrap(commands.deleteCompendiumEntry(id)),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['compendiumEntries', variables.compendiumId],
      });
    },

    onError: (error) => {
      logError('api', 'delete compendium entry failed', error);
    },
  });
}

export function useExportCampaign() {
  return useMutation({
    mutationFn: (destinationPath: string) =>
      unwrap(commands.exportCampaign(destinationPath)),

    onError: (error) => {
      logError('api', 'export campaign failed', error);
    },
  });
}

export function useImportCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sourcePath: string) =>
      unwrap(commands.importCampaign(sourcePath)),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['activeCampaign'] });
      queryClient.invalidateQueries({ queryKey: ['maps'] });
    },

    onError: (error) => {
      logError('api', 'import campaign failed', error);
    },
  });
}

export function useInstalledPlugins(enabled: boolean = true) {
  return useQuery({
    queryKey: ['plugins'],
    queryFn: () => unwrap(commands.listInstalledPlugins()),
    enabled,
    retry: false,
  });
}

export function useInstallPlugin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sourcePath: string) =>
      unwrap(commands.installPluginFromFile(sourcePath)),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plugins'] });
    },

    onError: (error) => {
      logError('api', 'install plugin failed', error);
    },
  });
}

export function useSetPluginActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      pluginId,
      isActive,
    }: {
      pluginId: string;
      isActive: boolean;
    }) => unwrap(commands.setPluginActive(pluginId, isActive)),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plugins'] });
    },

    onError: (error) => {
      logError('api', 'set plugin active failed', error);
    },
  });
}

export function useUninstallPlugin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (pluginId: string) =>
      unwrap(commands.uninstallPlugin(pluginId)),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plugins'] });
      queryClient.invalidateQueries({ queryKey: ['compendiums'] });
    },

    onError: (error) => {
      logError('api', 'uninstall plugin failed', error);
    },
  });
}

export function usePluginSheets(enabled: boolean = true) {
  return useQuery({
    queryKey: ['pluginSheets'],
    queryFn: () => unwrap(commands.listPluginSheets()),
    enabled,
    retry: false,
  });
}

export function usePluginSheet(pluginId?: string, sheetKey?: string) {
  return useQuery({
    queryKey: ['pluginSheet', pluginId, sheetKey],
    queryFn: () => unwrap(commands.getPluginSheet(pluginId!, sheetKey!)),
    enabled: Boolean(pluginId && sheetKey),
    retry: false,
  });
}