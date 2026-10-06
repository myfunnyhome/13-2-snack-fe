'use client';

import {
  type KeyboardEvent,
  type MouseEvent,
  type PropsWithChildren,
  useEffect,
  useRef,
} from 'react';

import { cn } from '@/utils/cn';

export const MODAL_TITLE_ID = 'modal-title';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

type ModalProps = PropsWithChildren<{
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}>;

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  );
}

export default function Modal({
  isOpen,
  onClose,
  className,
  children,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!isOpen || !dialog || dialog.contains(document.activeElement)) {
      return;
    }

    getFocusableElements(dialog)[0]?.focus();
  }, [isOpen, children]);

  if (!isOpen) return null;

  const handleBackdropClick = (event: MouseEvent<HTMLDivElement>): void => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (event.key === 'Escape') {
      onClose();
      return;
    }

    if (event.key !== 'Tab') {
      return;
    }

    const focusableElements = getFocusableElements(event.currentTarget);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (!firstElement || !lastElement) {
      event.preventDefault();
      return;
    }

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
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
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={MODAL_TITLE_ID}
        onKeyDown={handleKeyDown}
        className={cn(className)}
      >
        {children}
      </div>
    </div>
  );
}
