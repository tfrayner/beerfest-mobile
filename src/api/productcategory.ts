import { apiClient } from './client';
import type { ApiListResponse, ProductCategory } from '@/types/api';

export async function listProductCategories(): Promise<ProductCategory[]> {
  const res = await apiClient.get<ApiListResponse<ProductCategory>>('/productcategory/list');
  if (!res.data.success) throw new Error(res.data.error ?? 'Failed to list product categories');
  return res.data.objects;
}
