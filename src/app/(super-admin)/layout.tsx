import type { PropsWithChildren } from 'react';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import RoleGuard from '@/components/auth/RoleGuard';
import Gnb from '@/components/ui/LogoGnb/Gnb';

export default async function Layout({ children }: PropsWithChildren) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;
  const refreshToken = cookieStore.get('refreshToken')?.value;

  if (!accessToken && !refreshToken) {
    redirect('/signin');
  }

  return (
    <RoleGuard allowedRoles={['SUPER_ADMIN']}>
      <div className="flex min-h-dvh flex-col">
        <Gnb role="SUPER_ADMIN" />
        <main className="flex-1">
          <div className="mx-auto w-full max-w-[1440px]">{children}</div>
        </main>
      </div>
    </RoleGuard>
  );
}
