export interface AppError {
  message: string;
  status?: number;
  code?: string;
  isNetworkError?: boolean;
  isTimeout?: boolean;
  isAuthError?: boolean;
  isUnauthorized?: boolean;
  isForbidden?: boolean;
  isNotFound?: boolean;
  isServerError?: boolean;
  validationErrors?: unknown;
}
