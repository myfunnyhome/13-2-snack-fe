'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

import Button from '@/components/ui/Button/Button';
import TextFieldInput from '@/components/ui/TextField/TextFieldInput';
import { type UpdateMeInput, updateMe } from '@/lib/services/userService';
import { useAuth } from '@/providers/AuthProvider';

type ProfileFormValues = {
  organizationName: string;
  password: string;
  passwordConfirm: string;
};

/* ########### 전체 코드 AI로 작업이 되어서 리팩터링 예정입니다. 우선 1차 초안만 생성 했어요 ###########*/

const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 64;

export default function Page() {
  const router = useRouter();
  const { user, isLoading, refetchUser } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string>('');

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    defaultValues: {
      organizationName: '',
      password: '',
      passwordConfirm: '',
    },
    mode: 'onTouched',
  });

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const organizationName = watch('organizationName');
  const password = watch('password');

  const hasOrganizationNameChange =
    isSuperAdmin &&
    user !== null &&
    organizationName.trim() !== user.organization.name;
  const hasPasswordChange = password.length > 0;
  const canSubmit = hasOrganizationNameChange || hasPasswordChange;

  useEffect(() => {
    if (!user) {
      return;
    }

    reset({
      organizationName: user.organization.name,
      password: '',
      passwordConfirm: '',
    });
  }, [reset, user]);

  const handleUpdateProfile = handleSubmit(async (formValues) => {
    if (!user) {
      return;
    }

    setErrorMessage('');

    const input: UpdateMeInput = {};

    if (hasOrganizationNameChange) {
      input.organizationName = formValues.organizationName.trim();
    }

    if (hasPasswordChange) {
      input.password = formValues.password;
      input.passwordConfirm = formValues.passwordConfirm;
    }

    try {
      await updateMe(input);
      await refetchUser();

      router.replace('/products');
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : '프로필 변경에 실패했습니다.',
      );
    }
  });

  if (isLoading || !user) {
    // TODO(UX): 로딩 스피너/스켈레톤 교체 예정. 현재는 깜빡임 방지용 빈 화면
    return null;
  }

  return (
    <div className="flex min-h-[calc(100dvh-76px)] items-center justify-center px-6 py-14 md:min-h-[calc(100dvh-100px)] lg:min-h-[calc(100dvh-108px)]">
      <form
        onSubmit={handleUpdateProfile}
        className="flex w-full max-w-[420px] flex-col bg-white px-6 py-10 md:px-[60px] md:py-[50px] md:drop-shadow-[0px_0px_20px_rgba(0,0,0,0.08)]"
      >
        <h1 className="text-20-bold mb-10 text-primary-950">내 프로필 변경</h1>

        <div className="flex flex-col gap-6">
          {isSuperAdmin ? (
            <TextFieldInput
              label="기업명"
              placeholder="기업명을 입력해주세요"
              autoComplete="organization"
              disabled={isSubmitting}
              errorMessage={errors.organizationName?.message}
              className="w-full"
              {...register('organizationName', {
                validate: (value) =>
                  value.trim().length > 0 || '기업명을 입력해주세요',
              })}
            />
          ) : (
            <TextFieldInput
              label="기업명"
              value={user.organization.name}
              readOnly
              disabled
              className="w-full"
            />
          )}

          {isSuperAdmin ? (
            <TextFieldInput
              label="권한"
              value="최고 관리자"
              readOnly
              disabled
              className="w-full"
            />
          ) : null}

          <TextFieldInput
            label="이름"
            value={user.name}
            readOnly
            disabled
            className="w-full"
          />

          <TextFieldInput
            type="email"
            label="이메일"
            value={user.email}
            autoComplete="username"
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
            disabled={isSubmitting}
            errorMessage={errors.password?.message}
            className="w-full"
            {...register('password', {
              validate: (value) => {
                if (value.length === 0) {
                  return true;
                }

                if (value.length < PASSWORD_MIN_LENGTH) {
                  return '8자 이상 입력해주세요';
                }

                if (value.length > PASSWORD_MAX_LENGTH) {
                  return '64자 이하로 입력해주세요';
                }

                return true;
              },
            })}
          />

          <TextFieldInput
            type="password"
            label="비밀번호 확인"
            placeholder="비밀번호를 한번 더 입력해주세요"
            autoComplete="new-password"
            hasEye
            disabled={isSubmitting}
            errorMessage={errors.passwordConfirm?.message}
            className="w-full"
            {...register('passwordConfirm', {
              validate: (value) =>
                password.length === 0 ||
                value === password ||
                '비밀번호가 일치하지 않습니다',
            })}
          />
        </div>

        {errorMessage ? (
          <p className="text-error mt-4 text-[12px]">{errorMessage}</p>
        ) : null}

        <Button
          type="submit"
          text={isSubmitting ? '변경 중...' : '변경하기'}
          disabled={!canSubmit || isSubmitting}
          className="mt-10"
        />
      </form>
    </div>
  );
}
