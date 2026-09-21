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
    <div className="min-h-dvh">
      <Gnb variant="guest" />
      <main>
        <div className="mx-auto w-full max-w-[1440px]">{children}</div>
      </main>
    </div>
  );
}
