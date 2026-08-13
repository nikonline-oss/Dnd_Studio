import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { commands } from './bindings';

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


export function useMaps(enabled: boolean) {
  return useQuery({
    queryKey: ['maps'],
    queryFn: () => unwrap(commands.listMaps()),
    enabled,
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