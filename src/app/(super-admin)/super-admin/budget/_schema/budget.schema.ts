import { z } from 'zod';

export type BudgetForm = {
  startingBudget: string;
  defaultBudget: string;
};

export const budgetSchema = z
  .string()
  .regex(/^[0-9]\d*$/, '0 이상의 정수만 입력해주세요.');

export const budgetBodySchema = z.object({
  startingBudget: budgetSchema.transform(Number),
  defaultBudget: budgetSchema.transform(Number),
});

export type BudgetBody = z.infer<typeof budgetBodySchema>;
