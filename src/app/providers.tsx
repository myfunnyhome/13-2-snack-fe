'use client';

import type { PropsWithChildren } from 'react';

import ModalProvider from '@/providers/ModalProvider';
import ToastProvider from '@/providers/ToastProvider';

export default function Providers({ children }: PropsWithChildren) {
  return (
    <ToastProvider>
      <ModalProvider>{children}</ModalProvider>
    </ToastProvider>
  );
}
