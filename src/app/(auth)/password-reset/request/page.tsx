'use client';

import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';

import CompleteModal from '@/components/ui/Modal/CompleteModal';
import TextFieldInput from '@/components/ui/TextField/TextFieldInput';
import { useConfirmAndGoToSignin } from '@/hooks/auth/useConfirmAndGoToSignin';
import {
  type RequestPasswordResetInput,
  requestPasswordReset,
} from '@/lib/services/authService';
import { useModal } from '@/providers/ModalProvider';
import { getErrorMessage } from '@/utils/getErrorMessage';

import AuthFormCard from '../../_components/AuthFormCard';
import {
  type PasswordResetRequestFormValues,
  passwordResetRequestSchema,
} from './_schema/password-reset-request.schema';

export default function Page() {
  const { openModal } = useModal();
  const confirmAndGoToSignin = useConfirmAndGoToSignin();
  const [errorMessage, setErrorMessage] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<PasswordResetRequestFormValues>({
    resolver: zodResolver(passwordResetRequestSchema),
    defaultValues: {
      email: '',
    },
    mode: 'onTouched',
  });

  const requestPasswordResetMutation = useMutation<
    void,
    Error,
    RequestPasswordResetInput
  >({
    mutationFn: requestPasswordReset,
  });

  const handleRequestPasswordReset = handleSubmit(async (values) => {
    setErrorMessage('');

    try {
      await requestPasswordResetMutation.mutateAsync(values);

      openModal(
        <CompleteModal
          message="해당 이메일로 재설정 링크를 보냈습니다."
          onConfirm={confirmAndGoToSignin}
        />,
      );
    } catch (error) {
      setErrorMessage(
        getErrorMessage(error, '비밀번호 재설정 요청에 실패했습니다.'),
      );
    }
  });

  return (
    <AuthFormCard
      onSubmit={handleRequestPasswordReset}
      isSubmitDisabled={!isValid || isSubmitting}
      isSubmitting={isSubmitting}
      errorMessage={errorMessage}
      submitText="재설정 링크 보내기"
      submittingText="전송 중..."
    >
      <div className="mb-10 flex flex-col gap-3">
        <h1 className="text-20-bold text-primary-950">비밀번호 찾기</h1>
        <p className="text-14-regular text-primary-500">
          가입한 이메일을 입력하면 비밀번호 재설정 링크를 보내드립니다.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <TextFieldInput
          type="email"
          label="이메일"
          placeholder="이메일을 입력해주세요."
          autoComplete="email"
          disabled={isSubmitting}
          errorMessage={errors.email?.message}
          className="w-full"
          {...register('email')}
        />
      </div>
    </AuthFormCard>
  );
}
