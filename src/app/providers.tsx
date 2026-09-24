'use client';

import type { PropsWithChildren } from 'react';

import AuthProvider from '@/providers/AuthProvider';
import ModalProvider from '@/providers/ModalProvider';
import QueryProvider from '@/providers/QueryProvider';
import ToastProvider from '@/providers/ToastProvider';
import WishlistProvider from '@/providers/WishlistProvider';

export default function Providers({ children }: PropsWithChildren) {
  return (
    <QueryProvider>
      <ToastProvider>
        <AuthProvider>
          <WishlistProvider>
            <ModalProvider>{children}</ModalProvider>
          </WishlistProvider>
        </AuthProvider>
      </ToastProvider>
    </QueryProvider>
  );
}
