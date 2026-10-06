import { useCallback, useEffect, useState } from 'react';

import { type Budget, getBudget } from '@/lib/services/orderBudgetService';

type UseBudgetResult = {
  budget: Budget | null;
  isLoading: boolean;
  error: string | null;
  refetchBudget: () => Promise<Budget>;
};

export function useBudget(): UseBudgetResult {
  const [budget, setBudget] = useState<Budget | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refetchBudget = useCallback(async (): Promise<Budget> => {
    const data = await getBudget();
    setBudget(data);
    setError(null);
    return data;
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadBudget(): Promise<void> {
      setIsLoading(true);
      setError(null);

      try {
        const data = await getBudget();
        if (isMounted) {
          setBudget(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : '예산 정보를 불러오지 못했습니다.',
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadBudget();

    return () => {
      isMounted = false;
    };
  }, []);

  return { budget, isLoading, error, refetchBudget };
}
