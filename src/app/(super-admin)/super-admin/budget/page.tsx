'use client';
import { useState } from 'react';

import { useMutation, useQuery } from '@tanstack/react-query';

import Button from '@/components/ui/Button/Button';
import * as budgetService from '@/lib/services/budgetService';

import BudgetInput from './_components/BudgetInput';

export default function BudgetPage() {
  const { data, isFetching } = useQuery({
    queryKey: ['budget'],
    queryFn: () => budgetService.getBudgetSettings(),
  });
  console.log(data);
  // const [budgetData, setBudgetData] = useState({
  //   monthBudget: `${data.data.startingBudget}`,
  //   defaultBudget: `${data.data.defaultBudget}`,
  // });

  // // if (isFetching) return <div>로딩 중...</div>;
  // return (
  //   <div className="md:w-[447px]">
  //     <header className="flex flex-col gap-[8px]">
  //       <h1 className="text-18-bold">예산 관리</h1>
  //       <h2 className="text-14-regular text-primary-500">
  //         이번 달 예산을 정해서 지출을 관리해보세요
  //       </h2>
  //     </header>
  //     <div className="mt-[64px] mb-[120px]">
  //       <BudgetInput
  //         title="이번 달"
  //         budget={budgetData.monthBudget}
  //         setBudget={(newMonthBudget) =>
  //           setBudgetData((prev) => ({ ...prev, monthBudget: newMonthBudget }))
  //         }
  //         className="mb-[80px]"
  //       />
  //       <BudgetInput
  //         title="매달 시작"
  //         budget={budgetData.defaultBudget}
  //         setBudget={(newDefaultBudget) =>
  //           setBudgetData((prev) => ({
  //             ...prev,
  //             defaultBudget: newDefaultBudget,
  //           }))
  //         }
  //       />
  //     </div>
  //     <Button type="submit" variant="primary" text="수정하기" />
  //   </div>
  return <div></div>;
}
