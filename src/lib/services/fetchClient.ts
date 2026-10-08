type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
  code?: string;
};

type FetchClientOptions = RequestInit & {
  retried?: boolean;
};

type RefreshResult = {
  isSuccess: boolean;
  status: number;
  errorBody: Partial<ApiResponse<unknown>> | null;
};

type SessionEndHandler = (error: ApiError) => void;

const API_BASE_URL = '/api';

const SESSION_END_EXCLUDED_PATHS = ['/auth/signin', '/auth/signout'];

let refreshPromise: Promise<RefreshResult> | null = null;
let sessionEndHandler: SessionEndHandler | null = null;

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
    headers: { 'X-Requested-With': 'XMLHttpRequest' },
  });
}

async function readErrorBody(
  response: Response,
): Promise<Partial<ApiResponse<unknown>> | null> {
  return (await response.json().catch(() => null)) as Partial<
    ApiResponse<unknown>
  > | null;
}

async function toRefreshResult(response: Response): Promise<RefreshResult> {
  if (response.ok) {
    return { isSuccess: true, status: response.status, errorBody: null };
  }

  const errorBody = await readErrorBody(response);

  return { isSuccess: false, status: response.status, errorBody };
}

export function setSessionEndHandler(handler: SessionEndHandler): () => void {
  sessionEndHandler = handler;

  return () => {
    if (sessionEndHandler === handler) {
      sessionEndHandler = null;
    }
  };
}

function throwApiError(path: string, error: ApiError): never {
  if (error.status === 401 && !SESSION_END_EXCLUDED_PATHS.includes(path)) {
    sessionEndHandler?.(error);
  }

  throw error;
}

function getOrStartRefresh(): Promise<RefreshResult> {
  if (!refreshPromise) {
    refreshPromise = refreshAuth()
      .then(toRefreshResult)
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
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
      'X-Requested-With': 'XMLHttpRequest',
      ...headers,
    },
  });

  if (response.status === 401 && !retried) {
    const errorBody = await readErrorBody(response.clone());

    if (errorBody?.code === 'TOKEN_EXPIRED') {
      const refreshResult = await getOrStartRefresh();

      if (refreshResult.isSuccess) {
        return fetchClient<T>(path, {
          ...options,
          retried: true,
        });
      }

      throwApiError(
        path,
        new ApiError(
          refreshResult.errorBody?.message ??
            '세션이 만료되었습니다. 다시 로그인해주세요.',
          refreshResult.status,
          refreshResult.errorBody?.code,
        ),
      );
    }
  }

  const contentType = response.headers.get('content-type');
  const json = contentType?.includes('application/json')
    ? ((await response.json()) as Partial<ApiResponse<T>>)
    : null;

  if (!response.ok) {
    throwApiError(
      path,
      new ApiError(
        json?.message ?? `API request failed: ${response.status}`,
        response.status,
        json?.code,
      ),
    );
  }

  return json?.data as T;
}
