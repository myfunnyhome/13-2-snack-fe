import { fetchClient } from '@/lib/services/fetchClient';

export type MonthlyBudget = {
  id: number;
  organizationId: number;
  year: number;
  month: number;
  startingBudget: number;
  spentAmount: number;
  createdAt: string;
  updatedAt: string;
};

export type BudgetSummary = {
  currentMonthBudget: MonthlyBudget;
  previousMonthBudget: MonthlyBudget;
  currentYearSpending: number;
  previousYearSpending: number;
};

const ADMIN_BUDGET_SUMMARY_PATH = '/admin/budgets/summary';

export function getRemainingBudgetAmount(budget: MonthlyBudget): number {
  return budget.startingBudget - budget.spentAmount;
}

export async function getBudgetSummary(): Promise<BudgetSummary> {
  return fetchClient<BudgetSummary>(ADMIN_BUDGET_SUMMARY_PATH);
}
