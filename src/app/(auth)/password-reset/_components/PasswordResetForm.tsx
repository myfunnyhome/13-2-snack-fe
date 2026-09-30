'use client';

import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';

import CompleteModal from '@/components/ui/Modal/CompleteModal';
import TextFieldInput from '@/components/ui/TextField/TextFieldInput';
import { useConfirmAndGoToSignin } from '@/hooks/auth/useConfirmAndGoToSignin';
import {
  type ResetPasswordInput,
  resetPassword,
} from '@/lib/services/authService';
import { useModal } from '@/providers/ModalProvider';
import { getErrorMessage } from '@/utils/getErrorMessage';

import AuthFormCard from '../../_components/AuthFormCard';
import {
  type PasswordResetFormValues,
  passwordResetSchema,
} from '../password-reset.schema';

const INVALID_RESET_LINK_MESSAGE = '유효하지 않은 재설정 링크입니다.';

export default function PasswordResetForm() {
  const { openModal } = useModal();
  const confirmAndGoToSignin = useConfirmAndGoToSignin();
  const searchParams = useSearchParams();
  const resetPasswordToken = searchParams.get('token') ?? '';
  const hasResetPasswordToken = resetPasswordToken.length > 0;

  const [submitErrorMessage, setSubmitErrorMessage] = useState<string>('');
  const errorMessage =
    submitErrorMessage ||
    (hasResetPasswordToken ? '' : INVALID_RESET_LINK_MESSAGE);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<PasswordResetFormValues>({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: { password: '', passwordConfirm: '' },
    mode: 'onTouched',
  });

  const [password, passwordConfirm] = useWatch<
    PasswordResetFormValues,
    ['password', 'passwordConfirm']
  >({
    control,
    name: ['password', 'passwordConfirm'],
  });
  const canSubmit =
    hasResetPasswordToken && password.length > 0 && passwordConfirm.length > 0;

  const resetPasswordMutation = useMutation<void, Error, ResetPasswordInput>({
    mutationFn: resetPassword,
  });

  const handlePasswordReset = handleSubmit(async (formValues) => {
    setSubmitErrorMessage('');

    try {
      await resetPasswordMutation.mutateAsync({
        resetPasswordToken,
        ...formValues,
      });

      openModal(
        <CompleteModal
          message="비밀번호가 변경되었습니다"
          onConfirm={confirmAndGoToSignin}
        />,
      );
    } catch (error) {
      setSubmitErrorMessage(
        getErrorMessage(error, '비밀번호 재설정에 실패했습니다.'),
      );
    }
  });

  return (
    <AuthFormCard
      onSubmit={handlePasswordReset}
      isSubmitDisabled={!canSubmit || isSubmitting}
      isSubmitting={isSubmitting}
      errorMessage={errorMessage}
      submitText="비밀번호 변경하기"
      submittingText="변경 중..."
    >
      <div className="mb-10 flex flex-col gap-3">
        <h1 className="text-20-bold text-primary-950">비밀번호 재설정</h1>
        <p className="text-14-regular text-primary-500">
          새로 사용할 비밀번호를 입력해주세요.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <TextFieldInput
          type="password"
          label="새 비밀번호"
          placeholder="비밀번호를 입력해주세요"
          autoComplete="new-password"
          hasEye
          disabled={!hasResetPasswordToken || isSubmitting}
          errorMessage={errors.password?.message}
          className="w-full"
          {...register('password')}
        />

        <TextFieldInput
          type="password"
          label="새 비밀번호 확인"
          placeholder="비밀번호를 한 번 더 입력해주세요"
          autoComplete="new-password"
          hasEye
          disabled={!hasResetPasswordToken || isSubmitting}
          errorMessage={errors.passwordConfirm?.message}
          className="w-full"
          {...register('passwordConfirm')}
        />
      </div>
    </AuthFormCard>
  );
}
