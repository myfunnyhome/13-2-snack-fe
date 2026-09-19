type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
  code?: string;
};

type FetchClientOptions = RequestInit & {
  retried?: boolean;
};

const API_BASE_URL = '/api';

export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

async function refreshAuth(): Promise<Response> {
  return fetch(`${API_BASE_URL}/auth/refresh-token`, {
    method: 'POST',
    credentials: 'same-origin',
    cache: 'no-store',
  });
}

export async function fetchClient<T>(
  path: string,
  options: FetchClientOptions = {},
): Promise<T> {
  const { retried = false, headers, body, ...restOptions } = options;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...restOptions,
    body,
    credentials: 'same-origin',
    cache: restOptions.cache ?? 'no-store',
    headers: {
      ...(body &&
        !(body instanceof FormData) && { 'Content-Type': 'application/json' }),
      ...headers,
    },
  });

  if (response.status === 401 && !retried && path !== '/auth/refresh-token') {
    const errorBody = (await response
      .clone()
      .json()
      .catch(() => null)) as Partial<ApiResponse<unknown>> | null;

    if (errorBody?.code === 'TOKEN_EXPIRED') {
      const refreshResponse = await refreshAuth();

      if (refreshResponse.ok) {
        return fetchClient<T>(path, {
          ...options,
          retried: true,
        });
      }

      const refreshErrorBody = (await refreshResponse
        .json()
        .catch(() => null)) as Partial<ApiResponse<unknown>> | null;

      throw new ApiError(
        refreshErrorBody?.message ??
          '세션이 만료되었습니다. 다시 로그인해주세요.',
        refreshResponse.status,
        refreshErrorBody?.code,
      );
    }
  }

  const contentType = response.headers.get('content-type');
  const json = contentType?.includes('application/json')
    ? ((await response.json()) as Partial<ApiResponse<T>>)
    : null;

  if (!response.ok) {
    throw new ApiError(
      json?.message ?? `API request failed: ${response.status}`,
      response.status,
      json?.code,
    );
  }

  return json?.data as T;
}
