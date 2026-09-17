type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
  code?: string;
};

type FetchClientOptions = RequestInit & {
  skipRefresh?: boolean;
  retried?: boolean;
};

const API_BASE_URL = '/api';

async function parseResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return undefined as T;
  }

  const json = (await response.json()) as ApiResponse<T>;
  return json.data;
}

async function refreshAuth(): Promise<boolean> {
  const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
    method: 'POST',
    credentials: 'include',
  });

  return response.ok;
}

export async function fetchClient<T>(
  path: string,
  options: FetchClientOptions = {},
): Promise<T> {
  const {
    skipRefresh = false,
    retried = false,
    headers,
    body,
    ...restOptions
  } = options;

  const mergedHeaders: HeadersInit = {
    ...(body &&
      !(body instanceof FormData) && { 'Content-Type': 'application/json' }),
    ...headers,
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...restOptions,
    body,
    credentials: 'include',
    headers: mergedHeaders,
  });

  if (response.status === 401 && !skipRefresh && !retried) {
    const refreshed = await refreshAuth();

    if (refreshed) {
      return fetchClient<T>(path, {
        ...options,
        retried: true,
      });
    }
  }

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as Partial<
      ApiResponse<unknown>
    > | null;

    throw new Error(
      errorBody?.message ?? `API request failed: ${response.status}`,
    );
  }

  return parseResponse<T>(response);
}
