import { z } from 'zod';

import { toKoreanWon } from '@/utils/toKoreanWon';

type BudgetInputType = {
  title: string;
  budget: string;
  setBudget: (budget: string) => void;
  className?: string;
};

const budgetSchema = z.string().regex(/^\d+$/, '0 이상의 정수만 입력해주세요.');

export default function BudgetInput({
  title,
  budget,
  setBudget,
  className,
}: BudgetInputType) {
  const result = budgetSchema.safeParse(budget);
  const isInvalid = !result.success;

  return (
    <div className={className}>
      <h3 className="text-14-bold text-primary-950 mb-[12px]">{title}</h3>
      <div className="flex pb-[12px] border-b-2 border-primary-800">
        <input
          value={budget}
          placeholder="예산을 입력해주세요"
          onChange={(e) => {
            setBudget(e.target.value);
          }}
          className="flex-1 text-30-bold text-primary-950 placeholder:text-primary-200 focus:outline-none"
        />
        <p className="text-30-bold text-primary-950">원</p>
      </div>
      <p className="text-14-bold text-primary-500 mt-[12px]">
        {toKoreanWon(Number(budget) ?? '0원')}
      </p>
      {budget !== '' && isInvalid && (
        <p className="text-14-bold text-error mt-[8px]">
          잘못된 입력 양식입니다.
        </p>
      )}
    </div>
  );
}
