'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import {
  type MyProductsParams,
  type ProductListResponse,
  getMyProducts,
} from '@/lib/services/myproductService';

type UseMyProductsResult = {
  data: ProductListResponse | null;
  error: Error | null;
  isLoading: boolean;
  isFetching: boolean;
  refetch: () => void;
};

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError';
}

export function useMyProducts(params: MyProductsParams): UseMyProductsResult {
  const { limit, page, sort } = params;
  const [data, setData] = useState<ProductListResponse | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [requestVersion, setRequestVersion] = useState<number>(0);
  const isFirstRequestRef = useRef<boolean>(true);

  const refetch = useCallback((): void => {
    setRequestVersion((version) => version + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadMyProducts(): Promise<void> {
      if (isFirstRequestRef.current) {
        setIsLoading(true);
      } else {
        setIsFetching(true);
      }

      setError(null);

      try {
        const nextData = await getMyProducts(
          { limit, page, sort },
          controller.signal,
        );
        setData(nextData);
      } catch (caughtError: unknown) {
        if (isAbortError(caughtError)) return;

        setError(
          caughtError instanceof Error
            ? caughtError
            : new Error('상품을 불러오지 못했습니다.'),
        );
      } finally {
        if (!controller.signal.aborted) {
          isFirstRequestRef.current = false;
          setIsLoading(false);
          setIsFetching(false);
        }
      }
    }

    void loadMyProducts();

    return () => {
      controller.abort();
    };
  }, [limit, page, requestVersion, sort]);

  return { data, error, isLoading, isFetching, refetch };
}
