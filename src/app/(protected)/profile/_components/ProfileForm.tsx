'use client';

import { useState } from 'react';

import { useForm, useWatch } from 'react-hook-form';

import { ExclamationIcon } from '@/components/icons';
import Button from '@/components/ui/Button/Button';
import Fallback from '@/components/ui/Fallback/Fallback';
import LoadingFallback from '@/components/ui/LoadingFallback/LoadingFallback';
import TextFieldInput from '@/components/ui/TextField/TextFieldInput';
import { useUpdateProfile } from '@/hooks/auth/useUpdateProfile';
import {
  validatePasswordLength,
  validatePasswordMatch,
} from '@/lib/auth/passwordValidation';
import { type MeProfile, type UpdateMeInput } from '@/lib/services/userService';
import { useAuth } from '@/providers/AuthProvider';
import { cn } from '@/utils/cn';

const PROFILE_MIN_HEIGHT =
  'min-h-[calc(100dvh-76px)] md:min-h-[calc(100dvh-100px)] lg:min-h-[calc(100dvh-108px)]';

type ProfileFormValues = {
  organizationName: string;
  password: string;
  passwordConfirm: string;
};

type ProfileFormContentProps = {
  user: MeProfile;
};

function isOrganizationNameChanged(
  organizationName: string,
  initialOrganizationName: string,
): boolean {
  return organizationName.trim() !== initialOrganizationName;
}

function buildUpdateMeInput(
  values: ProfileFormValues,
  initialOrganizationName: string,
): UpdateMeInput {
  const input: UpdateMeInput = {};

  if (
    isOrganizationNameChanged(values.organizationName, initialOrganizationName)
  ) {
    input.organizationName = values.organizationName.trim();
  }

  if (values.password.length > 0) {
    input.password = values.password;
    input.passwordConfirm = values.passwordConfirm;
  }

  return input;
}

// TODO: 다른 Auth 폼과 일관되게 React Hook Form + Zod 검증으로 리팩터링
// role별 organizationName 검증과 선택적 password/passwordConfirm 검증을 함께 고려
export default function ProfileForm() {
  const { user, isLoading, error } = useAuth();

  if (isLoading) {
    return <LoadingFallback className={PROFILE_MIN_HEIGHT} />;
  }

  if (error && !user) {
    return (
      <Fallback
        icon={<ExclamationIcon className="size-[70px] text-red" />}
        title="문제가 발생했어요"
        description="잠시 후 다시 시도해주세요"
        actionText="다시 시도"
        onAction={() => window.location.reload()}
        className={PROFILE_MIN_HEIGHT}
      />
    );
  }

  if (!user) {
    return null;
  }

  return <ProfileFormContent user={user} />;
}

function ProfileFormContent({ user }: ProfileFormContentProps) {
  const { errorMessage, submitProfile } = useUpdateProfile();
  const [initialOrganizationName] = useState<string>(user.organization.name);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    defaultValues: {
      organizationName: initialOrganizationName,
      password: '',
      passwordConfirm: '',
    },
    mode: 'onTouched',
  });

  const isSuperAdmin = user.role === 'SUPER_ADMIN';
  const [organizationName, password] = useWatch<
    ProfileFormValues,
    ['organizationName', 'password']
  >({
    control,
    name: ['organizationName', 'password'],
  });
  const canSubmit =
    password.length > 0 ||
    isOrganizationNameChanged(organizationName, initialOrganizationName);

  const handleUpdateProfile = handleSubmit(async (formValues) => {
    const input = buildUpdateMeInput(formValues, initialOrganizationName);

    if (Object.keys(input).length === 0) {
      return;
    }

    await submitProfile(input);
  });

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
              validate: (value) =>
                value.length === 0 || validatePasswordLength(value),
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
              validate: (value, formValues) =>
                formValues.password.length === 0 ||
                validatePasswordMatch(value, formValues.password),
            })}
          />
        </div>

        <p
          role="alert"
          className={cn('text-error text-[12px]', errorMessage && 'mt-4')}
        >
          {errorMessage}
        </p>

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
