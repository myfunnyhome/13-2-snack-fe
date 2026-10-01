import { useState } from 'react';

import { useRouter } from 'next/navigation';

import CompleteModal from '@/components/ui/Modal/CompleteModal';
import { type UpdateMeInput } from '@/lib/services/userService';
import { useAuth } from '@/providers/AuthProvider';
import { useModal } from '@/providers/ModalProvider';
import { getErrorMessage } from '@/utils/getErrorMessage';

type UseUpdateProfileResult = {
  errorMessage: string;
  submitProfile: (input: UpdateMeInput) => Promise<void>;
};

export function useUpdateProfile(): UseUpdateProfileResult {
  const router = useRouter();
  const { logout, updateProfile } = useAuth();
  const { openModal, closeModal } = useModal();
  const [errorMessage, setErrorMessage] = useState<string>('');

  async function submitProfile(input: UpdateMeInput): Promise<void> {
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

      router.replace('/signin');
      router.refresh();

      openModal(
        <CompleteModal
          message="비밀번호가 변경되었습니다"
          onConfirm={closeModal}
        />,
      );
      return;
    }

    router.replace('/products');
    router.refresh();
  }

  return { errorMessage, submitProfile };
}
