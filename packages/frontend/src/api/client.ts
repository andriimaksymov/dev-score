import axios from 'axios';

/**
 * Normalized error thrown by every API call. Components can rely on `message`
 * being human-readable and never containing Axios internals.
 */
export class ApiError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error)) {
      // NestJS error bodies are { message: string | string[], ... }.
      const data = error.response?.data as { message?: string | string[] } | undefined;
      const message = Array.isArray(data?.message) ? data.message.join(', ') : data?.message;
      return Promise.reject(
        new ApiError(
          message ||
            (error.response
              ? `Request failed (${error.response.status})`
              : 'Network error — could not reach the server.'),
          error.response?.status
        )
      );
    }
    return Promise.reject(error instanceof Error ? error : new ApiError('Unexpected error'));
  }
);

export default apiClient;
