'use client';

import ToastProvider from '@/providers/ToastProvider';

export default function Providers({ children }: { children: React.ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}
