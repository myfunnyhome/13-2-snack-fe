'use client';

import { type PropsWithChildren, useState } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { ApiError } from '@/lib/services/fetchClient';

const MAX_QUERY_RETRY_COUNT = 2;

// 4xx(권한 없음·없는 리소스·세션 만료)는 다시 보내도 결과가 같으므로 재시도하지 않는다.
// 401 토큰 만료는 fetchClient가 재발급 후 한 번 더 보내므로 여기서 다시 시도할 필요가 없다.
function shouldRetryQuery(failureCount: number, error: Error): boolean {
  if (error instanceof ApiError && error.status < 500) return false;

  return failureCount < MAX_QUERY_RETRY_COUNT;
}

function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: shouldRetryQuery },
      mutations: { retry: false },
    },
  });
}

export default function QueryProvider({ children }: PropsWithChildren) {
  const [queryClient] = useState(createQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} />
      {children}
    </QueryClientProvider>
  );
}
