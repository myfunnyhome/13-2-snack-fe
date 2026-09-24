import { useEffect, useState } from 'react';

import { type OrderDetail, getOrderDetail } from '@/lib/services/orderService';

type UsePurchaseRequestDetailResult = {
  order: OrderDetail | null;
  isLoading: boolean;
  error: string | null;
};

export function usePurchaseRequestDetail(
  id: string,
): UsePurchaseRequestDetailResult {
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadOrder(): Promise<void> {
      setIsLoading(true);
      setError(null);

      try {
        const data = await getOrderDetail(id);
        if (isMounted) {
          setOrder(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : '요청 정보를 불러오지 못했습니다.',
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadOrder();

    return () => {
      isMounted = false;
    };
  }, [id]);

  return { order, isLoading, error };
}
