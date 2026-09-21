'use client';

import { useState } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

import Button from '@/components/ui/Button/Button';
import TextFieldInput from '@/components/ui/TextField/TextFieldInput';
import { useAuth } from '@/providers/AuthProvider';

// css 리팩터링 zod랑 맞춰서 전체적으로 재확인 필요 1차 초안만 완성

type SigninFormValues = {
  email: string;
  password: string;
};

export default function Page() {
  const router = useRouter();
  const { login } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SigninFormValues>({
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onTouched',
  });

  const handleSignin = handleSubmit(async (formValues) => {
    setErrorMessage('');

    try {
      const user = await login(formValues);

      if (!user) {
        setErrorMessage('로그인 정보를 확인해주세요.');
        return;
      }

      router.replace('/products');
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : '로그인 정보를 확인해주세요.',
      );
    }
  });

  return (
    <div className="flex min-h-[calc(100dvh-76px)] items-center justify-center px-6 py-14 md:min-h-[calc(100dvh-100px)] lg:min-h-[calc(100dvh-108px)]">
      <form
        onSubmit={handleSignin}
        className="flex w-full max-w-[420px] flex-col"
      >
        <div className="mb-10 flex flex-col gap-3">
          <h1 className="text-32-bold text-primary-950">로그인</h1>
        </div>

        <div className="flex flex-col gap-6">
          <TextFieldInput
            type="email"
            label="이메일"
            placeholder="이메일을 입력해주세요"
            autoComplete="email"
            disabled={isSubmitting}
            errorMessage={errors.email?.message}
            className="w-full"
            {...register('email', {
              required: '이메일을 입력해주세요.',
              pattern: {
                value: /\S+@\S+\.\S+/,
                message: '올바른 이메일 형식이 아닙니다.',
              },
            })}
          />

          <TextFieldInput
            type="password"
            label="비밀번호"
            placeholder="비밀번호를 입력해주세요"
            autoComplete="current-password"
            disabled={isSubmitting}
            hasEye
            errorMessage={errors.password?.message}
            className="w-full"
            {...register('password', {
              required: '비밀번호를 입력해주세요.',
              minLength: {
                value: 8,
                message: '비밀번호는 8자 이상이어야 합니다.',
              },
            })}
          />
        </div>

        {errorMessage ? (
          <p className="text-error mt-4 text-[12px]">{errorMessage}</p>
        ) : null}

        <Button
          type="submit"
          text={isSubmitting ? '로그인 중...' : '로그인'}
          disabled={isSubmitting}
          className="mt-10"
        />

        <div className="text-16-regular mt-7 flex justify-center gap-2 text-primary-500">
          <span>기업 담당자이신가요?</span>
          <Link href="/signup" className="text-primary-950">
            회원가입
          </Link>
        </div>
      </form>
    </div>
  );
}
