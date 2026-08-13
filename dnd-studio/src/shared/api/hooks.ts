import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  commands
} from './bindings';

export function useCampaigns() {
  return useQuery({
    queryKey: ['campaigns'],
    queryFn: commands.listCampaigns,
  });
}

export function useActiveCampaign() {
  return useQuery({
    queryKey: ['activeCampaign'],
    queryFn: commands.getActiveCampaign,
    retry: false,
  });
}

export function useCreateCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: commands.createCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['activeCampaign'] });
    },
  });
}

export function useOpenCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: commands.openCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['activeCampaign'] });
    },
  });
}