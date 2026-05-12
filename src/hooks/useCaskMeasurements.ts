import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listDipsByCask,
  listMeasurementBatches,
  submitMeasurement,
  type MeasurementSubmit,
} from '@/api/caskmeasurement';

export function useMeasurementBatches(festivalId: number) {
  return useQuery({
    queryKey: ['measurementBatches', festivalId],
    queryFn: () => listMeasurementBatches(festivalId),
    staleTime: 5 * 60 * 1000,
    enabled: festivalId > 0,
  });
}

export function useCaskDips(caskId: number) {
  return useQuery({
    queryKey: ['dips', caskId],
    queryFn: () => listDipsByCask(caskId),
    enabled: caskId > 0,
  });
}

export function useSubmitMeasurement(caskId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (changes: MeasurementSubmit[]) => submitMeasurement(changes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dips', caskId] });
      queryClient.invalidateQueries({ queryKey: ['cask', caskId] });
    },
  });
}
