'use client';

import { useState } from 'react';

import { useMutation } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import logo from '@/assets/images/logo.png';
import Button from '@/components/ui/Button/Button';
import TextFieldInput from '@/components/ui/TextField/TextFieldInput';
import { signup } from '@/lib/services/authService';

type SuperAdminSignupFormValues = {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
  organizationName: string;
  bizRegNumber: string;
};

const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 64;
const EMAIL_MAX_LENGTH = 254;
const EMAIL_PATTERN = z.regexes.email;
const BIZ_REG_NUMBER_PATTERN = /^\d{10}$/;

function toDigits(value: string): string {
  return value.replace(/-/g, '');
}

export default function Page() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string>('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting, isValid },
  } = useForm<SuperAdminSignupFormValues>({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      passwordConfirm: '',
      organizationName: '',
      bizRegNumber: '',
    },
    mode: 'onTouched',
  });

  const password = watch('password');
  const canSubmit = isValid;
  const signupMutation = useMutation({ mutationFn: signup });

  const handleSuperAdminSignup = handleSubmit(async (values) => {
    setErrorMessage('');

    try {
      await signupMutation.mutateAsync({
        name: values.name,
        email: values.email,
        password: values.password,
        passwordConfirm: values.passwordConfirm,
        organizationName: values.organizationName,
        bizRegNumber: toDigits(values.bizRegNumber),
      });

      router.replace('/signin');
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : '회원가입에 실패했습니다.',
      );
    }
  });

  return (
    <div className="flex min-h-[calc(100dvh-76px)] flex-col items-center justify-center gap-10 px-6 py-14 md:min-h-[calc(100dvh-100px)] lg:min-h-[calc(100dvh-108px)]">
      <Image
        src={logo}
        alt="Snack"
        width={206}
        height={88}
        className="h-12 w-auto md:h-16 lg:h-[88px]"
        priority
      />

      <form
        onSubmit={handleSuperAdminSignup}
        className="flex w-full max-w-[420px] flex-col bg-white px-6 py-10 md:px-[60px] md:py-[50px] md:drop-shadow-[0px_0px_20px_rgba(0,0,0,0.08)]"
      >
        <div className="mb-10 flex flex-col gap-3">
          <h1 className="text-20-bold text-primary-950">
            기업 담당자 회원가입
          </h1>
          <p className="text-14-regular text-primary-500">
            • 그룹 내 유저는 기업 담당자의 초대 메일을 통해 가입이 가능합니다.
          </p>
        </div>

        <div className="flex flex-col gap-6">
          <TextFieldInput
            label="이름"
            placeholder="이름(기업 담당자)을 입력해주세요."
            autoComplete="name"
            disabled={isSubmitting}
            errorMessage={errors.name?.message}
            className="w-full"
            {...register('name', {
              required: '이름을 입력해주세요',
              validate: (value) =>
                value.trim().length > 0 || '이름을 입력해주세요',
            })}
          />

          <TextFieldInput
            type="email"
            label="이메일"
            placeholder="이메일을 입력해주세요."
            autoComplete="email"
            disabled={isSubmitting}
            errorMessage={errors.email?.message}
            className="w-full"
            {...register('email', {
              required: '이메일을 입력해주세요',
              maxLength: {
                value: EMAIL_MAX_LENGTH,
                message: '254자 이하로 입력해주세요',
              },
              pattern: {
                value: EMAIL_PATTERN,
                message: '올바른 이메일 형식이 아닙니다',
              },
            })}
          />

          <TextFieldInput
            type="password"
            label="비밀번호"
            placeholder="비밀번호를 입력해주세요."
            autoComplete="new-password"
            hasEye
            disabled={isSubmitting}
            errorMessage={errors.password?.message}
            className="w-full"
            {...register('password', {
              required: '비밀번호를 입력해주세요',
              // BE superAdminSignupSchema가 trim 후 길이를 검사하므로 동일 기준 적용
              validate: (value) => {
                const trimmed = value.trim();

                if (trimmed.length < PASSWORD_MIN_LENGTH) {
                  return '8자 이상 입력해주세요';
                }

                if (trimmed.length > PASSWORD_MAX_LENGTH) {
                  return '64자 이하로 입력해주세요';
                }

                return true;
              },
            })}
          />

          <TextFieldInput
            type="password"
            label="비밀번호 확인"
            placeholder="비밀번호를 한 번 더 입력해주세요"
            autoComplete="new-password"
            hasEye
            disabled={isSubmitting}
            errorMessage={errors.passwordConfirm?.message}
            className="w-full"
            {...register('passwordConfirm', {
              required: '비밀번호를 한 번 더 입력해주세요',
              validate: (value) =>
                value.trim() === password.trim() ||
                '비밀번호가 일치하지 않습니다',
            })}
          />

          <TextFieldInput
            label="회사명"
            placeholder="회사명을 입력해주세요."
            autoComplete="organization"
            disabled={isSubmitting}
            errorMessage={errors.organizationName?.message}
            className="w-full"
            {...register('organizationName', {
              required: '회사명을 입력해주세요',
              validate: (value) =>
                value.trim().length > 0 || '회사명을 입력해주세요',
            })}
          />

          <TextFieldInput
            label="사업자 번호"
            placeholder="사업자 번호를 입력해주세요"
            inputMode="numeric"
            disabled={isSubmitting}
            errorMessage={errors.bizRegNumber?.message}
            className="w-full"
            {...register('bizRegNumber', {
              required: '사업자 번호를 입력해주세요',
              validate: (value) =>
                BIZ_REG_NUMBER_PATTERN.test(toDigits(value)) ||
                '사업자 번호는 숫자 10자리여야 합니다',
            })}
          />
        </div>

        {errorMessage ? (
          <p className="text-error mt-4 text-[12px]">{errorMessage}</p>
        ) : null}

        <Button
          type="submit"
          text={isSubmitting ? '가입 중...' : '가입하기'}
          disabled={!canSubmit || isSubmitting}
          className="mt-10"
        />

        <div className="text-14-regular mt-7 flex justify-center gap-2 text-primary-500">
          <span>이미 계정이 있으신가요?</span>
          <Link href="/signin" className="text-primary-950 underline">
            로그인
          </Link>
        </div>
      </form>
    </div>
  );
}
