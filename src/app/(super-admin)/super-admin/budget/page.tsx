'use client';
import { useEffect, useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';
import { useMutation, useQuery } from '@tanstack/react-query';

import { CheckIcon } from '@/components/icons';
import Button from '@/components/ui/Button/Button';
import * as budgetService from '@/lib/services/budgetService';
import { useToast } from '@/providers/ToastProvider';

import BudgetInput from './_components/BudgetInput';
import { type BudgetBody, budgetBodySchema } from './_schema/budget.schema';

export default function BudgetPage() {
  const queryClient = useQueryClient();
  const { open } = useToast('bottom');
  const [budgetData, setBudgetData] = useState({
    startingBudget: '',
    defaultBudget: '',
  });

  const { data, isFetching } = useQuery({
    queryKey: ['budget'],
    queryFn: () => budgetService.getBudgetSettings(),
  });
  const mutation = useMutation({
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
  console.log(data);

  useEffect(() => {
    if (!data) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBudgetData({
      startingBudget: `${data.startingBudget}`,
      defaultBudget: `${data.defaultBudget}`,
    });
  }, [data]);

  if (isFetching) return <div>로딩 중...</div>;
  return (
    <div className="md:w-[447px] pb-[141]">
      <header className="flex flex-col gap-[8px]">
        <h1 className="text-18-bold">예산 관리</h1>
        <h2 className="text-14-regular text-primary-500">
          이번 달 예산을 정해서 지출을 관리해보세요
        </h2>
      </header>
      <div className="mt-[64px] mb-[120px]">
        <BudgetInput
          title="이번 달"
          budget={budgetData.startingBudget}
          setBudget={(newStartingBudget) =>
            setBudgetData((prev) => ({
              ...prev,
              startingBudget: newStartingBudget,
            }))
          }
          className="mb-[80px]"
        />
        <BudgetInput
          title="매달 시작"
          budget={budgetData.defaultBudget}
          setBudget={(newDefaultBudget) =>
            setBudgetData((prev) => ({
              ...prev,
              defaultBudget: newDefaultBudget,
            }))
          }
        />
      </div>
      <Button
        type="submit"
        variant="primary"
        text="수정하기"
        onClick={() => {
          const result = budgetBodySchema.safeParse(budgetData);

          if (!result.success) {
            return alert('잘못 된 형식의 데이터를 포함합니다.');
          }

          mutation.mutate(result.data);
        }}
      />
    </div>
  );
}
