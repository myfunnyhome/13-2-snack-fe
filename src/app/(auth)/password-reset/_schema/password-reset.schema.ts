import { z } from 'zod';

import {
  passwordConfirmSchema,
  passwordSchema,
  withPasswordConfirm,
} from '@/lib/auth/authSchemas';

export const passwordResetSchema = withPasswordConfirm(
  z.object({
    password: passwordSchema,
    passwordConfirm: passwordConfirmSchema,
  }),
);

export type PasswordResetFormValues = z.infer<typeof passwordResetSchema>;
