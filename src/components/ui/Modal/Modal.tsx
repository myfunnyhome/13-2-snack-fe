'use client';

import { type MouseEvent, type PropsWithChildren } from 'react';

import { cn } from '@/utils/cn';

type ModalProps = PropsWithChildren<{
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}>;

export default function Modal({
  isOpen,
  onClose,
  className,
  children,
}: ModalProps) {
  if (!isOpen) return null;

  const handleBackdropClick = (event: MouseEvent<HTMLDivElement>): void => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      onClick={handleBackdropClick}
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center',
        'bg-black/50 backdrop-blur-[4px]',
      )}
    >
      <div className={cn(className)}>{children}</div>
    </div>
  );
}
