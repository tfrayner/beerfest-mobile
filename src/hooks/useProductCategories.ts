import { useQuery } from '@tanstack/react-query';
import { listProductCategories } from '@/api/productcategory';

export function useProductCategories() {
  return useQuery({
    queryKey: ['productCategories'],
    queryFn: listProductCategories,
    staleTime: Infinity,
  });
}
