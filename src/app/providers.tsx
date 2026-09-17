'use client';

import type { PropsWithChildren } from 'react';

import AuthProvider from '@/providers/AuthProvider';
import ModalProvider from '@/providers/ModalProvider';
import ToastProvider from '@/providers/ToastProvider';

export default function Providers({ children }: PropsWithChildren) {
  return (
    <ToastProvider>
      <AuthProvider>
        <ModalProvider>{children}</ModalProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
