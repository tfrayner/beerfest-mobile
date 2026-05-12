import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listCasks, listCasksByStillage, loadCask, submitCask } from '@/api/casks';
import type { Cask } from '@/types/api';

export function useCasksByStillage(stillageLocationId: number) {
  return useQuery({
    queryKey: ['casks', 'stillage', stillageLocationId],
    queryFn: () => listCasksByStillage(stillageLocationId),
    enabled: stillageLocationId > 0,
  });
}

export function useCasks(festivalId: number, categoryId: number) {
  return useQuery({
    queryKey: ['casks', 'festival', festivalId, categoryId],
    queryFn: () => listCasks(festivalId, categoryId),
    enabled: festivalId > 0 && categoryId > 0,
  });
}

export function useCask(caskId: number) {
  return useQuery({
    queryKey: ['cask', caskId],
    queryFn: () => loadCask(caskId),
    enabled: caskId > 0,
  });
}

export function useSubmitCask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (changes: Partial<Cask>[]) => submitCask(changes),
    onSuccess: (_data, variables) => {
      // Invalidate the specific cask and any cask lists
      const caskId = variables[0]?.cask_id;
      if (caskId) {
        queryClient.invalidateQueries({ queryKey: ['cask', caskId] });
      }
      queryClient.invalidateQueries({ queryKey: ['casks'] });
    },
  });
}
