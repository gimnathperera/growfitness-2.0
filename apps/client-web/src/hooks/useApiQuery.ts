import { useQuery, type UseQueryOptions, type UseQueryResult } from '@tanstack/react-query';
import type { ApiError } from '@/services/api';

/**
 * A strongly-typed wrapper around React Query's useQuery.
 * @template TData The type of the data returned by the query.
 * @template TError The type of error returned by the query (default: ApiError).
 * @param queryKey Unique key to identify the query.
 * @param queryFn Async function to fetch data.
 * @param options Optional React Query options, excluding queryKey and queryFn.
 * @returns The query result with strongly-typed data and error.
 */
export function useApiQuery<
  TData,
  TError = ApiError
>(
  queryKey: readonly string[], // safer readonly array
  queryFn: () => Promise<TData>,
  options?: Omit<UseQueryOptions<TData, TError, TData, readonly string[]>, 'queryKey' | 'queryFn'>
): UseQueryResult<TData, TError> {
  return useQuery<TData, TError, TData, readonly string[]>({
    queryKey,
    queryFn,
    ...options,
  });
}
