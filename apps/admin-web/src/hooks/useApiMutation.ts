import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
  useQueryClient,
} from '@tanstack/react-query';
import { ApiError } from '@/services/api';

export function useApiMutation<TData, TVariables, TError = ApiError>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: Omit<UseMutationOptions<TData, TError, TVariables>, 'mutationFn'> & {
    invalidateQueries?: string[][];
  }
): UseMutationResult<TData, TError, TVariables> {
  const queryClient = useQueryClient();

  return useMutation<TData, TError, TVariables>({
    mutationFn,
    onSuccess: (data, variables, context) => {
      // Invalidate specified queries
      if (options?.invalidateQueries) {
        options.invalidateQueries.forEach(queryKey => {
          queryClient.invalidateQueries({ queryKey });
        });
      }
      // Call original onSuccess if provided
      if (options?.onSuccess) {
        options.onSuccess(data, variables, context as any);
      }
    },
    ...options,
  });
}
