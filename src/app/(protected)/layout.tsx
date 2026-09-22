import type { PropsWithChildren } from 'react';

import { redirect } from 'next/navigation';

import Gnb from '@/components/ui/LogoGnb/Gnb';
import { checkAuthWithRefresh } from '@/lib/auth/session';

import WishlistNavigationBoundary from './WishlistNavigationBoundary';

export default async function Layout({ children }: PropsWithChildren) {
  const isAuthenticated = await checkAuthWithRefresh();
  if (!isAuthenticated) {
    redirect('/signin');
  }

  return (
    <WishlistNavigationBoundary>
      <div className="flex min-h-dvh flex-col">
        <Gnb />
        <main className="flex-1">
          <div className="mx-auto w-full max-w-[1440px]">{children}</div>
        </main>
      </div>
    </WishlistNavigationBoundary>
  );
}
