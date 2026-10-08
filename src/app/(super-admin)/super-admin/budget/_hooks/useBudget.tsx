import { useEffect, useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';
import { useMutation, useQuery } from '@tanstack/react-query';

import { CheckIcon } from '@/components/icons';
import * as budgetService from '@/lib/services/budgetService';
import { useToast } from '@/providers/ToastProvider';

import { type BudgetBody, budgetBodySchema } from '../_schema/budget.schema';

export default function useBudget() {
  const { open } = useToast('bottom');
  const queryClient = useQueryClient();

  const [budgetData, setBudgetData] = useState({
    startingBudget: '',
    defaultBudget: '',
  });

  // 1. budget 관련 데이터 불러오는 query
  const { data, isPending } = useQuery({
    queryKey: ['budget'],
    queryFn: () => budgetService.getBudgetSettings(),
  });
  useEffect(() => {
    if (!data) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBudgetData({
      startingBudget: `${data.startingBudget}`,
      defaultBudget: `${data.defaultBudget}`,
    });
  }, [data]);

  // 2. budget 데이터 수정하는 mutation
  const updateBudgetMutation = useMutation({
    mutationFn: (body: BudgetBody) => budgetService.updateBudgetSettings(body),

    onSuccess: () => {
      open({
        text: '예산이 변경되었습니다.',
        icon: <CheckIcon fill="#D9D9D9" />,
      });
      queryClient.invalidateQueries({
        queryKey: ['budget'],
      });
    },
  });

  // 3. budget 데이터 수정하는 함수 (수정 전에 schema 확인)
  const handleUpdateBudget = () => {
    const result = budgetBodySchema.safeParse(budgetData);

    if (!result.success) {
      return alert('잘못된 형식의 데이터를 포함합니다.');
    }

    updateBudgetMutation.mutate(result.data);
  };

  return {
    isPending,
    budgetData,
    setBudgetData,
    updateBudgetMutation,
    handleUpdateBudget,
  };
}
