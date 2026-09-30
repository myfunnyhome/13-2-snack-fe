import { z } from 'zod';

import {
  passwordConfirmSchema,
  passwordSchema,
  withPasswordConfirm,
} from '@/lib/auth/authSchemas';

export const inviteSignupSchema = withPasswordConfirm(
  z.object({
    password: passwordSchema,
    passwordConfirm: passwordConfirmSchema,
  }),
);

export type InviteSignupFormValues = z.infer<typeof inviteSignupSchema>;
