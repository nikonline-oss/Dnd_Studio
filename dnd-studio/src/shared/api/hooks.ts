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
    mutationFn: ({ mapId, x, y }: CreateTokenVars) =>
      unwrap(commands.createToken(mapId, x, y)),

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