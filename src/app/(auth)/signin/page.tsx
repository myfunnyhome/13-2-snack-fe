'use client';

import type { ChangeEvent } from 'react';
import { useState } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

import Button from '@/components/ui/Button/Button';
import TextFieldInput from '@/components/ui/TextField/TextFieldInput';
import { useAuth } from '@/providers/AuthProvider';

// 전체 코드 AI로 작업이 되어서 리팩터링 예정입니다. 우선 1차 초안만 생성 했어요

type SigninFormValues = {
  email: string;
  password: string;
};

export default function Page() {
  const router = useRouter();
  const { login } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string>('');

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { isSubmitting },
  } = useForm<SigninFormValues>({
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onTouched',
  });

  const email = watch('email');
  const password = watch('password');
  const canSubmit = email.trim().length > 0 && password.length > 0;

  const handleEmailChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setValue('email', event.target.value, { shouldValidate: true });
  };

  const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setValue('password', event.target.value, { shouldValidate: true });
  };

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
          <p className="text-16-regular text-primary-500">
            간식대장 계정으로 로그인해주세요.
          </p>
        </div>

        <div className="flex flex-col gap-6">
          <TextFieldInput
            type="email"
            label="이메일"
            placeholder="이메일을 입력해주세요"
            autoComplete="email"
            value={email}
            onChange={handleEmailChange}
            disabled={isSubmitting}
            className="w-full"
          />

          <TextFieldInput
            type="password"
            label="비밀번호"
            placeholder="비밀번호를 입력해주세요"
            autoComplete="current-password"
            value={password}
            onChange={handlePasswordChange}
            disabled={isSubmitting}
            hasEye
            className="w-full"
          />
        </div>

        {errorMessage ? (
          <p className="text-error mt-4 text-[12px]">{errorMessage}</p>
        ) : null}

        <Button
          type="submit"
          text={isSubmitting ? '로그인 중...' : '로그인'}
          disabled={!canSubmit || isSubmitting}
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
