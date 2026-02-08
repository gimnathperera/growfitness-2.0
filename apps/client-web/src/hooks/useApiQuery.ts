import { useQuery, type UseQueryOptions, type UseQueryResult } from '@tanstack/react-query';
import type { ApiError } from '@/services/api';

export function useApiQuery<TData, TError = ApiError>(
  queryKey: string[],
  queryFn: () => Promise<TData>,
  options?: Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'>
): UseQueryResult<TData, TError> {
  return useQuery<TData, TError>({
    queryKey,
    queryFn,
    ...options,
  });
}
