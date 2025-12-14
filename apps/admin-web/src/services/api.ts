const API_BASE_URL = '/api';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

export interface ApiError {
  statusCode: number;
  errorCode: string;
  message: string;
  timestamp: string;
  path: string;
}

async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type');
  const isJson = contentType?.includes('application/json');

  if (!response.ok) {
    const error: ApiError = isJson
      ? await response.json()
      : {
          statusCode: response.status,
          errorCode: 'UNKNOWN_ERROR',
          message: await response.text(),
          timestamp: new Date().toISOString(),
          path: response.url,
        };

    throw error;
  }

  if (isJson) {
    const result: ApiResponse<T> = await response.json();
    return result.data;
  }

  return (await response.text()) as unknown as T;
}

export async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const token = localStorage.getItem('accessToken');

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options?.headers,
    },
  });

  return handleResponse<T>(response);
}

export const api = {
  get: <T>(endpoint: string) => apiRequest<T>(endpoint, { method: 'GET' }),
  post: <T>(endpoint: string, data?: unknown) =>
    apiRequest<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),
  patch: <T>(endpoint: string, data?: unknown) =>
    apiRequest<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    }),
  delete: <T>(endpoint: string) => apiRequest<T>(endpoint, { method: 'DELETE' }),
};

