import { useQuery } from '@tanstack/react-query';
import { listFestivals, currentFestival } from '@/api/festivals';

export function useFestivals() {
  return useQuery({
    queryKey: ['festivals'],
    queryFn: listFestivals,
  });
}

export function useCurrentFestival() {
  return useQuery({
    queryKey: ['currentFestival'],
    queryFn: currentFestival,
  });
}

export function useCurrentFestivalId(): number | undefined {
  const { data: current } = useCurrentFestival();
  return current?.festival_id;
}
