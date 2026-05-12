import { useQuery } from '@tanstack/react-query';
import { listStillageLocations } from '@/api/stillagelocation';

export function useStillageLocations(festivalId: number) {
  return useQuery({
    queryKey: ['stillageLocations', festivalId],
    queryFn: () => listStillageLocations(festivalId),
    enabled: festivalId > 0,
  });
}
