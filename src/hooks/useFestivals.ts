import { useQuery } from '@tanstack/react-query';
import { listFestivals } from '@/api/festivals';

export function useFestivals() {
  return useQuery({
    queryKey: ['festivals'],
    queryFn: listFestivals,
  });
}

const CURRENT_FESTIVAL_NAME = process.env.EXPO_PUBLIC_CURRENT_FESTIVAL ?? '';

export function useCurrentFestivalId(): number | undefined {
  const { data: festivals } = useFestivals();
  return festivals?.find((f) => f.name === CURRENT_FESTIVAL_NAME)?.festival_id;
}
