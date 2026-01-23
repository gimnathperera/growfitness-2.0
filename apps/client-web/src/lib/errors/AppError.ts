export interface AppError {
  message: string;
  status?: number;
  code?: string;
  isNetworkError?: boolean;
  isTimeout?: boolean;
  isAuthError?: boolean;
}
