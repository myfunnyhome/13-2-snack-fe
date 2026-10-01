'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';

import Button from '@/components/ui/Button/Button';
import CompleteModal from '@/components/ui/Modal/CompleteModal';
import TextFieldInput from '@/components/ui/TextField/TextFieldInput';
import {
  validatePasswordLength,
  validatePasswordMatch,
} from '@/lib/auth/passwordValidation';
import { type MeProfile, type UpdateMeInput } from '@/lib/services/userService';
import { useAuth } from '@/providers/AuthProvider';
import { useModal } from '@/providers/ModalProvider';
import { cn } from '@/utils/cn';
import { getErrorMessage } from '@/utils/getErrorMessage';

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

export default function ProfileForm() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return <ProfileFormContent user={user} />;
}

function ProfileFormContent({ user }: ProfileFormContentProps) {
  const router = useRouter();
  const { logout, updateProfile } = useAuth();
  const { openModal, closeModal } = useModal();
  const [errorMessage, setErrorMessage] = useState<string>('');
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

  function handleConfirmPasswordChanged(): void {
    closeModal();
    router.replace('/signin');
    router.refresh();
  }

  const handleUpdateProfile = handleSubmit(async (formValues) => {
    const input = buildUpdateMeInput(formValues, initialOrganizationName);

    if (Object.keys(input).length === 0) {
      return;
    }

    setErrorMessage('');

    try {
      await updateProfile(input);
    } catch (error) {
      setErrorMessage(getErrorMessage(error, '프로필 변경에 실패했습니다.'));
      return;
    }

    if (input.password !== undefined) {
      try {
        await logout();
      } catch {}

      openModal(
        <CompleteModal
          message="비밀번호가 변경되었습니다"
          onConfirm={handleConfirmPasswordChanged}
        />,
      );
      return;
    }

    router.replace('/products');
    router.refresh();
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
