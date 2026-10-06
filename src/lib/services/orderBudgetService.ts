import { fetchClient } from './fetchClient';

type MonthlyBudget = {
  startingBudget: number;
  spentAmount: number;
};

type BudgetSummaryResponse = {
  currentMonthBudget: MonthlyBudget;
  previousMonthBudget: MonthlyBudget;
  currentYearSpending: number;
  previousYearSpending: number;
};

export type Budget = {
  spentAmount: number;
  remainingBudget: number;
};

export async function getBudget(): Promise<Budget> {
  const data = await fetchClient<BudgetSummaryResponse>(
    '/admin/budgets/summary',
  );
  const { startingBudget, spentAmount } = data.currentMonthBudget;

  return {
    spentAmount,
    remainingBudget: startingBudget - spentAmount,
  };
}
