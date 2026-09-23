'use client';

import type { PropsWithChildren } from 'react';

import AuthProvider from '@/providers/AuthProvider';
import ModalProvider from '@/providers/ModalProvider';
import QueryProvider from '@/providers/QueryProvider';
import ToastProvider from '@/providers/ToastProvider';

export default function Providers({ children }: PropsWithChildren) {
  return (
    <QueryProvider>
      <ToastProvider>
        <AuthProvider>
          <ModalProvider>{children}</ModalProvider>
        </AuthProvider>
      </ToastProvider>
    </QueryProvider>
  );
}
