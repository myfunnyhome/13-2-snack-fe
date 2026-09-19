'use client';

import type { PropsWithChildren } from 'react';
import { useEffect } from 'react';

import { useRouter } from 'next/navigation';

import type { UserRole } from '@/lib/services/userService';
import { useAuth } from '@/providers/AuthProvider';

type RoleGuardProps = PropsWithChildren<{
  allowedRoles: UserRole[];
}>;

export default function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const canAccess = user !== null && allowedRoles.includes(user.role);

  useEffect(() => {
    if (isLoading || canAccess) {
      return;
    }

    router.replace(user ? '/' : '/signin');
  }, [canAccess, isLoading, router, user]);

  if (isLoading || !canAccess) {
    // TODO(UX): 로딩 스피너/스켈레톤 교체 예정. 현재는 깜빡임 방지용 빈 화면
    return null;
  }

  return <>{children}</>;
}
