'use client';

import Button from '@/components/ui/Button/Button';

import BudgetInput from './_components/BudgetInput';
import useBudget from './_hooks/useBudget';

export default function BudgetPage() {
  const {
    isPending,
    isUpdating,
    budgetData,
    setBudgetData,
    handleUpdateBudget,
  } = useBudget();

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
          isPending={isPending}
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
          isPending={isPending}
        />
      </div>
      <Button
        type="submit"
        variant="primary"
        text="수정하기"
        disabled={
          isPending ||
          isUpdating ||
          budgetData.startingBudget === '' ||
          budgetData.defaultBudget === ''
        }
        onClick={handleUpdateBudget}
      />
    </div>
  );
}
