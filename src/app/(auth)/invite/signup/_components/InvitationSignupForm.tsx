'use client';

import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';

import CompleteModal from '@/components/ui/Modal/CompleteModal';
import TextFieldInput from '@/components/ui/TextField/TextFieldInput';
import {
  type SignupInput,
  type SignupResult,
  signup,
} from '@/lib/services/authService';
import {
  type Invitation,
  getInvitation,
} from '@/lib/services/invitationService';
import { useModal } from '@/providers/ModalProvider';
import { getErrorMessage } from '@/utils/getErrorMessage';

import AuthFormCard from '../../../_components/AuthFormCard';
import {
  type InviteSignupFormValues,
  inviteSignupSchema,
} from '../invite-signup.schema';

function getInvitationErrorMessage(
  invitationToken: string,
  isError: boolean,
  error: Error | null,
): string {
  if (!invitationToken) {
    return '유효하지 않은 초대 링크입니다.';
  }

  if (isError) {
    return getErrorMessage(error, '초대 정보를 불러오지 못했습니다.');
  }

  return '';
}

export default function InvitationSignupForm() {
  const router = useRouter();
  const { openModal, closeModal } = useModal();
  const searchParams = useSearchParams();
  const invitationToken = searchParams.get('token') ?? '';

  const [submitErrorMessage, setSubmitErrorMessage] = useState<string>('');

  const invitationQuery = useQuery<Invitation, Error>({
    queryKey: ['invitation', invitationToken],
    queryFn: () => getInvitation(invitationToken),
    enabled: Boolean(invitationToken),
    retry: false,
  });
  const invitation = invitationQuery.data ?? null;
  const isLoadingInvitation = invitationQuery.isLoading;
  const invitationErrorMessage = getInvitationErrorMessage(
    invitationToken,
    invitationQuery.isError,
    invitationQuery.error,
  );
  const errorMessage = submitErrorMessage || invitationErrorMessage;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<InviteSignupFormValues>({
    resolver: zodResolver(inviteSignupSchema),
    defaultValues: { password: '', passwordConfirm: '' },
    mode: 'onTouched',
  });

  const password = useWatch({ control, name: 'password' });
  const passwordConfirm = useWatch({ control, name: 'passwordConfirm' });
  const canSubmit =
    invitation !== null && password.length > 0 && passwordConfirm.length > 0;

  const signupMutation = useMutation<SignupResult, Error, SignupInput>({
    mutationFn: signup,
  });

  function handleConfirmSignupCompleted(): void {
    closeModal();
    router.replace('/signin');
  }

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

      openModal(
        <CompleteModal
          message="회원가입을 축하드립니다!"
          onConfirm={handleConfirmSignupCompleted}
        />,
      );
    } catch (error) {
      setSubmitErrorMessage(getErrorMessage(error, '회원가입에 실패했습니다.'));
    }
  });

  return (
    <AuthFormCard
      onSubmit={handleInvitationSignup}
      isSubmitDisabled={!canSubmit || isSubmitting}
      isSubmitting={isSubmitting}
      errorMessage={errorMessage}
    >
      <div className="mb-10 flex flex-col gap-3">
        <h1 className="text-20-bold text-primary-950">
          {invitation ? `${invitation.name} 님, 만나서 반갑습니다.` : ' '}
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
          {...register('password')}
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
          {...register('passwordConfirm')}
        />
      </div>
    </AuthFormCard>
  );
}
