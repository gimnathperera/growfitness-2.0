import {
  useMutation,
  type UseMutationOptions,
  type UseMutationResult,
  useQueryClient,
} from '@tanstack/react-query';
import type { ApiError } from '@/services/api';

export function useApiMutation<TData, TVariables, TError = ApiError>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: Omit<UseMutationOptions<TData, TError, TVariables>, 'mutationFn'> & {
    invalidateQueries?: string[][];
  }
): UseMutationResult<TData, TError, TVariables> {
  const queryClient = useQueryClient();

  const { invalidateQueries, onSuccess, ...restOptions } = options || {};

  return useMutation<TData, TError, TVariables>({
    mutationFn,
    ...restOptions,
    onSuccess: (data, variables, context) => {
      // Invalidate specified queries
      if (invalidateQueries) {
        invalidateQueries.forEach(queryKey => {
          queryClient.invalidateQueries({ queryKey });
        });
      }
      // Call original onSuccess if provided
      if (onSuccess) {
        // Type assertion needed due to react-query v5 type signature differences
        (onSuccess as (data: TData, variables: TVariables, context: unknown) => void)(data, variables, context);
      }
    },
  });
}
