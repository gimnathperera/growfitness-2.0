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

  // Type guard to check if error has a message property
  const isErrorWithMessage = (e: unknown): e is { message: string } => {
    return typeof e === 'object' && e !== null && 'message' in e && typeof (e as { message: unknown }).message === 'string';
  };

  // Type guard to check if error has a status property
  const isErrorWithStatus = (e: unknown): e is { status: unknown } => {
    return typeof e === 'object' && e !== null && 'status' in e;
  };

  // Type guard to check if error has a data property
  const isErrorWithData = (e: unknown): e is { data: unknown } => {
    return typeof e === 'object' && e !== null && 'data' in e;
  };

  // Type guard to check if error has an error property
  const isErrorWithError = (e: unknown): e is { error: unknown } => {
    return typeof e === 'object' && e !== null && 'error' in e;
  };

  // Check for timeout error
  if (isErrorWithMessage(error) && error.message === 'Request timeout') {
    return {
      message: 'Request is taking too long. Please check your internet connection.',
      isTimeout: true,
    };
  }

  // RTK Query network error
  if (isErrorWithStatus(error) && error.status === 'FETCH_ERROR') {
    const errorMessage = isErrorWithError(error) && typeof error.error === 'string' 
      ? error.error 
      : 'Unable to connect to the server. Please try again later.';
    
    return {
      message: errorMessage,
      isNetworkError: true,
    };
  }

  // Handle error objects with status codes
  if (isErrorWithStatus(error) && typeof error.status === 'number') {
    const status = error.status;
    const data = isErrorWithData(error) ? error.data : undefined;

    // Handle 401 Unauthorized
    if (status === 401) {
      return {
        message: 'Your session has expired. Please log in again.',
        isUnauthorized: true,
        status,
      };
    }

    // Handle 403 Forbidden
    if (status === 403) {
      return {
        message: 'You do not have permission to perform this action.',
        isForbidden: true,
        status,
      };
    }

    // Handle 404 Not Found
    if (status === 404) {
      return {
        message: 'The requested resource was not found.',
        isNotFound: true,
        status,
      };
    }

    // Handle 422 Unprocessable Entity (validation errors)
    if (status === 422 && data && typeof data === 'object' && 'errors' in data) {
      return {
        message: 'Validation error. Please check your input.',
        validationErrors: (data as { errors: unknown }).errors,
        status,
      };
    }

    // Handle other 4xx errors
    if (status >= 400 && status < 500) {
      const message = (data && typeof data === 'object' && 'message' in data && typeof data.message === 'string')
        ? data.message
        : 'There was an error with your request.';
      
      return {
        message,
        status,
      };
    }

    // Handle 5xx errors
    if (status >= 500) {
      return {
        message: 'The server encountered an error. Please try again later.',
        isServerError: true,
        status,
      };
    }
  }

  // Standard Error object
  if (error instanceof Error) {
    return {
      message: error.message,
    };
  }

  // Fallback for other error formats
  if (typeof error === 'string') {
    return { message: error };
  }

  return defaultError;
}
