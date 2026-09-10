'use client';
import Image from 'next/image';

import closeIcon from '@/assets/icons/close.svg';
import { cn } from '@/utils/cn';

import type { ToastItem } from './Toast.types';

type ToastProps = ToastItem & {
  onClose: (id: string) => void;
};

export default function Toast({
  id,
  icon,
  text,
  secondaryText,
  onClose,
  className,
}: ToastProps) {
  return (
    <div
      className={cn(
        'w-full h-[80px] px-[14px] bg-black/80 text-white flex justify-between align-center rounded-[4px] shadow-[0_10px_8px_0_rgba(0,0,0,0.1)] animate-fade-in-top md:px-[14px]',
        className,
      )}
    >
      <div className="flex items-center gap-[8px]">
        {icon && (
          <Image src={icon} alt="토스트 아이콘" width={24} height={24} />
        )}
        <p>{text}</p>
      </div>
      <div className="flex items-center gap-[12px]">
        {secondaryText && <p>{secondaryText}</p>}
        <Image
          src={closeIcon}
          alt="토스트 삭제 아이콘"
          width={24}
          height={24}
          className="cursor-pointer w-[24px] h-[24px]"
          onClick={() => onClose(id)}
        />
      </div>
    </div>
  );
}
