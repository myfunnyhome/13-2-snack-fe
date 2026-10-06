import { z } from 'zod';

import {
  validatePasswordLength,
  validatePasswordMatch,
} from '@/lib/auth/passwordValidation';

const EMAIL_MAX_LENGTH = 254;

export function requiredTrimmed(message: string) {
  return z.string().refine((value) => value.trim().length > 0, message);
}

export const emailSchema = z
  .string()
  .min(1, '이메일을 입력해주세요')
  .max(EMAIL_MAX_LENGTH, '254자 이하로 입력해주세요')
  .regex(z.regexes.email, '올바른 이메일 형식이 아닙니다');

export const passwordSchema = z
  .string()
  .min(1, '비밀번호를 입력해주세요')
  .superRefine((value, ctx) => {
    const result = validatePasswordLength(value);

    if (result !== true) {
      ctx.addIssue({ code: 'custom', message: result });
    }
  });

export const passwordConfirmSchema = z
  .string()
  .min(1, '비밀번호를 한 번 더 입력해주세요');

type PasswordConfirmValues = {
  password: string;
  passwordConfirm: string;
};

export function withPasswordConfirm<T extends z.ZodType<PasswordConfirmValues>>(
  schema: T,
): T {
  return schema.refine(
    (values: PasswordConfirmValues) =>
      validatePasswordMatch(values.passwordConfirm, values.password) === true,
    { error: '비밀번호가 일치하지 않습니다', path: ['passwordConfirm'] },
  );
}
