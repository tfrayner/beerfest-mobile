import { useQuery } from '@tanstack/react-query';
import { listFestivals } from '@/api/festivals';

export function useFestivals() {
  return useQuery({
    queryKey: ['festivals'],
    queryFn: listFestivals,
  });
}
