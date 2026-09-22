import { z } from 'zod';

export const signinSchema = z.object({
  // BE signinSchema와 동일 기준: 이메일은 z.email(), 비밀번호는 빈 값만 검사(길이 정책은 가입/변경에서만)
  email: z
    .string()
    .min(1, '이메일을 입력해주세요.')
    .pipe(z.email('올바른 이메일 형식이 아닙니다.')),
  password: z.string().min(1, '비밀번호를 입력해주세요.'),
});

export type SigninFormValues = z.infer<typeof signinSchema>;
