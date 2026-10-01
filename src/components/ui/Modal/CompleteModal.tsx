import Button from '@/components/ui/Button/Button';
import { MODAL_TITLE_ID } from '@/components/ui/Modal/Modal';
import { cn } from '@/utils/cn';

type CompleteModalProps = {
  message: string;
  onConfirm: () => void;
  className?: string;
};

export default function CompleteModal({
  message,
  onConfirm,
  className,
}: CompleteModalProps) {
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
      <p
        id={MODAL_TITLE_ID}
        className="text-center text-18-bold text-primary-950"
      >
        {message}
      </p>

      <Button
        text="확인"
        onClick={onConfirm}
        className="h-auto py-[17px] text-14-bold md:py-[23px] md:text-16-bold"
      />
    </div>
  );
}
