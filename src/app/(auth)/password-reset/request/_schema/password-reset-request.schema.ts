import { z } from 'zod';

import { emailSchema } from '@/lib/auth/authSchemas';

export const passwordResetRequestSchema = z.object({
  email: emailSchema,
});

export type PasswordResetRequestFormValues = z.infer<
  typeof passwordResetRequestSchema
>;
