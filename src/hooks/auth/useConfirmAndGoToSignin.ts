import { useRouter } from 'next/navigation';

import { useModal } from '@/providers/ModalProvider';

export function useConfirmAndGoToSignin(): () => void {
  const router = useRouter();
  const { closeModal } = useModal();

  return function confirmAndGoToSignin(): void {
    closeModal();
    router.replace('/signin');
  };
}
