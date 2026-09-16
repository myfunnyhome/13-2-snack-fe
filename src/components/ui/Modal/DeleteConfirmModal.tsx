'use client';

import { CloseIcon } from '@/components/icons';
import Button from '@/components/ui/Button/Button';
import { useModal } from '@/providers/ModalProvider';
import { cn } from '@/utils/cn';

type DeleteConfirmVariant = 'product' | 'purchaseRequest';

type DeleteConfirmText = {
  title: string;
  description: string;
  confirmLabel: string;
};

type DeleteConfirmTextMap = Record<DeleteConfirmVariant, DeleteConfirmText>;

type DeleteConfirmModalProps = {
  variant: DeleteConfirmVariant;
  targetName: string;
  onConfirm: () => void;
  className?: string;
};

const DELETE_CONFIRM_TEXT: DeleteConfirmTextMap = {
  product: {
    title: '상품을 삭제하시겠어요?',
    description: '삭제 후에는 복구할 수 없습니다.',
    confirmLabel: '상품 삭제',
  },
  purchaseRequest: {
    title: '구매 요청을 취소하시겠어요?',
    description: '구매 요청 취소 후에는 복구할 수 없습니다.',
    confirmLabel: '요청 취소',
  },
};

export default function DeleteConfirmModal({
  variant,
  targetName,
  onConfirm,
  className,
}: DeleteConfirmModalProps) {
  const { closeModal } = useModal();

  const { title, description, confirmLabel } = DELETE_CONFIRM_TEXT[variant];

  return (
    <div
      className={cn(
        'flex w-[90vw] max-w-[327px] flex-col items-center',
        'gap-9 rounded-md bg-white px-[20px] pt-[30px] pb-[20px]',
        'drop-shadow-[0px_0px_15px_rgba(0,0,0,0.14)]',
        'md:max-w-[512px] md:px-[30px] md:pt-[40px] md:pb-[30px]',
        className,
      )}
    >
      <div className="flex w-full flex-col items-center gap-5 md:gap-7.5">
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-16-bold text-primary-950 md:text-18-bold">
            {title}
          </h2>

          <p className="max-w-[255px] text-center text-14-regular text-primary-900 md:max-w-none md:text-16-regular">
            {description}
          </p>
        </div>

        <div className="flex items-center gap-1">
          <CloseIcon className="size-5 text-red" />

          <span className="text-14-extrabold text-primary-950 md:text-16-extrabold">
            {targetName}
          </span>
        </div>
      </div>

      <div className="flex w-full items-center gap-2.5 md:gap-5">
        <Button
          text="더 생각해볼게요"
          variant="secondary"
          onClick={closeModal}
          className="h-auto flex-1 py-[17px] text-14-bold md:py-[23px] md:text-16-bold"
        />

        <Button
          text={confirmLabel}
          onClick={onConfirm}
          className="h-auto flex-1 border border-transparent py-[17px] text-14-bold md:py-[23px] md:text-16-bold"
        />
      </div>
    </div>
  );
}
