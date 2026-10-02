import { useEffect, useState } from 'react';

import {
  type OrderListItem,
  type OrderListSort,
  getOrgOrders,
} from '@/lib/services/purchaseRequestService';

type UsePurchaseRequestListResult = {
  requests: OrderListItem[];
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
};

export function usePurchaseRequestList(
  sort: OrderListSort | undefined,
  page: number,
): UsePurchaseRequestListResult {
  const [requests, setRequests] = useState<OrderListItem[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;

    async function loadRequests(): Promise<void> {
      setIsLoading(true);
      setError(null);

      try {
        const result = await getOrgOrders({ status: 'PENDING', sort, page });
        if (isMounted) {
          setRequests(result.items);
          setTotalPages(result.totalPages);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : '목록을 불러오지 못했습니다.',
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadRequests();

    return () => {
      isMounted = false;
    };
  }, [sort, page, refreshToken]);

  function refetch(): void {
    setRefreshToken((prev) => prev + 1);
  }

  return { requests, totalPages, isLoading, error, refetch };
}
