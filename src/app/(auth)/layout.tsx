import type { PropsWithChildren } from 'react';

import { redirect } from 'next/navigation';

import Gnb from '@/components/ui/LogoGnb/Gnb';
import { checkAuth } from '@/lib/auth/session';

export default async function Layout({ children }: PropsWithChildren) {
  const isAuthenticated = await checkAuth();

  if (isAuthenticated) {
    redirect('/products');
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <Gnb variant="guest" />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-[1440px]">{children}</div>
      </main>
    </div>
  );
}
