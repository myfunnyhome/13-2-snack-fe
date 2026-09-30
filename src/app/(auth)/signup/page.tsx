'use client';

import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

import CompleteModal from '@/components/ui/Modal/CompleteModal';
import TextFieldInput from '@/components/ui/TextField/TextFieldInput';
import {
  type SignupInput,
  type SignupResult,
  signup,
} from '@/lib/services/authService';
import { useModal } from '@/providers/ModalProvider';
import { getErrorMessage } from '@/utils/getErrorMessage';

import AuthFormCard from '../_components/AuthFormCard';
import { type SignupFormValues, signupSchema, toDigits } from './signup.schema';

export default function Page() {
  const router = useRouter();
  const { openModal, closeModal } = useModal();
  const [errorMessage, setErrorMessage] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
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

  const signupMutation = useMutation<SignupResult, Error, SignupInput>({
    mutationFn: signup,
  });

  function handleConfirmSignupCompleted(): void {
    closeModal();
    router.replace('/signin');
  }

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

      openModal(
        <CompleteModal
          message="회원가입을 축하드립니다!"
          onConfirm={handleConfirmSignupCompleted}
        />,
      );
    } catch (error) {
      setErrorMessage(getErrorMessage(error, '회원가입에 실패했습니다.'));
    }
  });

  return (
    <AuthFormCard
      onSubmit={handleSuperAdminSignup}
      isSubmitDisabled={!isValid || isSubmitting}
      isSubmitting={isSubmitting}
      errorMessage={errorMessage}
    >
      <div className="mb-10 flex flex-col gap-3">
        <h1 className="text-20-bold text-primary-950">기업 담당자 회원가입</h1>
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
          {...register('name')}
        />

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

        <TextFieldInput
          type="password"
          label="비밀번호"
          placeholder="비밀번호를 입력해주세요"
          autoComplete="new-password"
          hasEye
          disabled={isSubmitting}
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
          disabled={isSubmitting}
          errorMessage={errors.passwordConfirm?.message}
          className="w-full"
          {...register('passwordConfirm')}
        />

        <TextFieldInput
          label="회사명"
          placeholder="회사명을 입력해주세요."
          autoComplete="organization"
          disabled={isSubmitting}
          errorMessage={errors.organizationName?.message}
          className="w-full"
          {...register('organizationName')}
        />

        <TextFieldInput
          label="사업자 번호"
          placeholder="사업자 번호를 입력해주세요"
          inputMode="numeric"
          disabled={isSubmitting}
          errorMessage={errors.bizRegNumber?.message}
          className="w-full"
          {...register('bizRegNumber')}
        />
      </div>
    </AuthFormCard>
  );
}
