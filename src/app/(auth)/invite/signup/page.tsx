'use client';

import { Suspense, useState } from 'react';

import { useMutation, useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';

import logo from '@/assets/images/logo.png';
import Button from '@/components/ui/Button/Button';
import TextFieldInput from '@/components/ui/TextField/TextFieldInput';
import { signup } from '@/lib/services/authService';
import { getInvitation } from '@/lib/services/invitationService';

type InvitationSignupFormValues = {
  password: string;
  passwordConfirm: string;
};

const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 64;

function InvitationSignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const invitationToken = searchParams.get('token') ?? '';

  const [submitErrorMessage, setSubmitErrorMessage] = useState<string>('');

  const invitationQuery = useQuery({
    queryKey: ['invitation', invitationToken],
    queryFn: () => getInvitation(invitationToken),
    enabled: Boolean(invitationToken),
    retry: false,
  });
  const invitation = invitationQuery.data ?? null;
  const isLoadingInvitation = invitationQuery.isLoading;
  const invitationErrorMessage = !invitationToken
    ? '유효하지 않은 초대 링크입니다.'
    : invitationQuery.isError
      ? invitationQuery.error instanceof Error
        ? invitationQuery.error.message
        : '초대 정보를 불러오지 못했습니다.'
      : '';
  const errorMessage = submitErrorMessage || invitationErrorMessage;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<InvitationSignupFormValues>({
    defaultValues: { password: '', passwordConfirm: '' },
    mode: 'onTouched',
  });

  const password = watch('password');
  const passwordConfirm = watch('passwordConfirm');
  const canSubmit =
    invitation !== null && password.length > 0 && passwordConfirm.length > 0;

  const signupMutation = useMutation({ mutationFn: signup });

  const handleInvitationSignup = handleSubmit(async (formValues) => {
    if (!invitation) {
      return;
    }

    setSubmitErrorMessage('');

    try {
      await signupMutation.mutateAsync({
        invitationToken,
        name: invitation.name,
        email: invitation.email,
        password: formValues.password,
        passwordConfirm: formValues.passwordConfirm,
      });

      router.replace('/signin');
    } catch (error) {
      setSubmitErrorMessage(
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
        onSubmit={handleInvitationSignup}
        className="flex w-full max-w-[420px] flex-col bg-white px-6 py-10 md:px-[60px] md:py-[50px] md:drop-shadow-[0px_0px_20px_rgba(0,0,0,0.08)]"
      >
        <div className="mb-10 flex flex-col gap-3">
          <h1 className="text-20-bold text-primary-950">
            {invitation
              ? `${invitation.name} 님, 만나서 반갑습니다.`
              : '\u00A0'}
          </h1>
          <p className="text-14-regular text-primary-500">
            비밀번호를 입력해 회원가입을 완료해주세요.
          </p>
        </div>

        <div className="flex flex-col gap-6">
          <TextFieldInput
            type="email"
            label="이메일"
            placeholder="이메일을 입력해주세요"
            value={invitation?.email ?? ''}
            readOnly
            disabled
            className="w-full"
          />

          <TextFieldInput
            type="password"
            label="비밀번호"
            placeholder="비밀번호를 입력해주세요"
            autoComplete="new-password"
            hasEye
            disabled={isLoadingInvitation || isSubmitting}
            errorMessage={errors.password?.message}
            className="w-full"
            {...register('password', {
              required: '비밀번호를 입력해주세요',
              // BE invitationSignupSchema가 trim 후 길이를 검사하므로 동일 기준 적용
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
            disabled={isLoadingInvitation || isSubmitting}
            errorMessage={errors.passwordConfirm?.message}
            className="w-full"
            {...register('passwordConfirm', {
              required: '비밀번호를 한 번 더 입력해주세요',
              validate: (value) =>
                value.trim() === password.trim() ||
                '비밀번호가 일치하지 않습니다',
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

export default function Page() {
  return (
    <Suspense fallback={null}>
      <InvitationSignupForm />
    </Suspense>
  );
}
