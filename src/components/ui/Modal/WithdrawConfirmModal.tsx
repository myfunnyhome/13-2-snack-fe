'use client';

import { ExclamationIcon } from '@/components/icons';
import Button from '@/components/ui/Button/Button';
import { useModal } from '@/providers/ModalProvider';
import { cn } from '@/utils/cn';

type WithdrawConfirmModalProps = {
  name: string;
  email: string;
  onConfirm: () => void;
  className?: string;
};

export default function WithdrawConfirmModal({
  name,
  email,
  onConfirm,
  className,
}: WithdrawConfirmModalProps) {
  const { closeModal } = useModal();

  return (
    <div
      className={cn(
        'flex w-[90vw] max-w-[327px] flex-col items-center',
        'gap-9 rounded-md bg-white px-[30px] pt-[40px] pb-[30px]',
        'drop-shadow-[0px_0px_15px_rgba(0,0,0,0.14)]',
        'md:max-w-[512px]',
        className,
      )}
    >
      <div className="flex flex-col items-center gap-2">
        <h2 className="text-18-bold text-primary-950">계정 탈퇴</h2>

        <ExclamationIcon className="hidden size-5 text-red md:block" />

        <p className="text-center text-16-regular-lead text-primary-900">
          <span className="text-16-bold-lead">
            {name}({email})
          </span>
          님의 <br className="md:hidden" />
          계정을 탈퇴시킬까요?
        </p>
      </div>

      <div className="flex w-full items-center gap-2.5 md:gap-5">
        <Button
          text="더 생각해볼게요"
          variant="secondary"
          onClick={closeModal}
          className="h-auto flex-1 py-[17px] text-14-bold md:py-[23px] md:text-16-bold"
        />

        <Button
          text="탈퇴시키기"
          onClick={onConfirm}
          className="h-auto flex-1 border border-transparent py-[17px] text-14-bold md:py-[23px] md:text-16-bold"
        />
      </div>
    </div>
  );
}
