import { z } from 'zod';

import {
  emailSchema,
  passwordConfirmSchema,
  passwordSchema,
  requiredTrimmed,
  withPasswordConfirm,
} from '@/lib/auth/authSchemas';

const BIZ_REG_NUMBER_PATTERN = /^\d{10}$/;

export function toDigits(value: string): string {
  return value.replace(/-/g, '');
}

export const signupSchema = withPasswordConfirm(
  z.object({
    name: requiredTrimmed('이름을 입력해주세요'),
    email: emailSchema,
    password: passwordSchema,
    passwordConfirm: passwordConfirmSchema,
    organizationName: requiredTrimmed('회사명을 입력해주세요'),
    bizRegNumber: z
      .string()
      .min(1, '사업자 번호를 입력해주세요')
      .refine(
        (value) => BIZ_REG_NUMBER_PATTERN.test(toDigits(value)),
        '사업자 번호는 숫자 10자리여야 합니다',
      ),
  }),
);

export type SignupFormValues = z.infer<typeof signupSchema>;
