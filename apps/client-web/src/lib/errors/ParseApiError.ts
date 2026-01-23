import type { AppError } from './AppError';

/**
 * Normalizes ANY error (RTK Query, fetch, thrown Error, etc.)
 * into a predictable AppError shape.
 */
export function parseApiError(error: unknown): AppError {
  const defaultError: AppError = {
    message: 'Something went wrong. Please try again.',
  };

  if (!error || typeof error !== 'object') {
    return defaultError;
  }

  const err = error as any;

  /** Timeout (manual Promise.race or similar) */
  if (err.message === 'Request timeout') {
    return {
      message:
        'Request is taking too long. Please check your internet connection.',
      isTimeout: true,
    };
  }

  /** RTK Query network error */
  if (err.status === 'FETCH_ERROR') {
    return {
      message:
        'Unable to connect to the server. Please check your internet connection.',
      isNetworkError: true,
    };
  }

  /** HTTP status errors */
  if (typeof err.status === 'number') {
    switch (err.status) {
      case 400:
        return {
          message: err.data?.message || 'Invalid request.',
          status: 400,
        };

      case 401:
        return {
          message: 'Session expired. Please sign in again.',
          status: 401,
          isAuthError: true,
        };

      case 403:
        return {
          message: 'You do not have permission to perform this action.',
          status: 403,
        };

      case 404:
        return {
          message: 'Requested resource was not found.',
          status: 404,
        };

      default:
        if (err.status >= 500) {
          return {
            message: 'Server error. Please try again later.',
            status: err.status,
          };
        }

        return {
          message: err.data?.message || 'Request failed.',
          status: err.status,
        };
    }
  }

  /** Validation errors (common backend pattern) */
  if (err.data?.error?.details) {
    const messages = Object.values(err.data.error.details);
    return {
      message: messages.join(', '),
    };
  }

  /** Generic JS Error */
  if (err.message) {
    return {
      message: err.message,
    };
  }

  return defaultError;
}
