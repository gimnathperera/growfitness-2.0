import { useToast } from '@/hooks/useToast';
import { parseApiError } from './ParseApiError';

export function useHandleError() {
  const { toast } = useToast();

  const handleError = (
    error: unknown,
    options?: { silent?: boolean; onAuthError?: () => void }
  ) => {
    const parsed = parseApiError(error);

    if (parsed.isAuthError && options?.onAuthError) {
      options.onAuthError();
    }

    if (!options?.silent) {
      toast.error(parsed.message);
    }

    return parsed;
  };

  return handleError;
}
