import { z } from 'zod';

export type BudgetForm = {
  startingBudget: string;
  defaultBudget: string;
};

export type BudgetBody = z.infer<typeof budgetBodySchema>;

export const budgetSchema = z
  .string()
  .regex(/^\d+$/, '0 이상의 정수만 입력해주세요.');

export const budgetBodySchema = z.object({
  startingBudget: z.coerce.number().int().min(0),
  defaultBudget: z.coerce.number().int().min(0),
});
