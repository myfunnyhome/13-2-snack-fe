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

async function refreshAuth(): Promise<Response> {
  return fetch(`${API_BASE_URL}/auth/refresh-token`, {
    method: 'POST',
    credentials: 'same-origin',
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
    headers: {
      ...(body &&
        !(body instanceof FormData) && { 'Content-Type': 'application/json' }),
      ...headers,
    },
  });

  if (response.status === 401 && !retried) {
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
    }
  }

  const json = (await response.json().catch(() => null)) as Partial<
    ApiResponse<T>
  > | null;

  if (!response.ok) {
    throw new Error(json?.message ?? `API request failed: ${response.status}`);
  }

  return json?.data as T;
}
