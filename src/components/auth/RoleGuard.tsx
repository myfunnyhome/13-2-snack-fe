'use client';

import type { PropsWithChildren } from 'react';
import { useEffect } from 'react';

import { useRouter } from 'next/navigation';

import LoadingFallback from '@/components/ui/LoadingFallback/LoadingFallback';
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

    router.replace(user ? '/products' : '/signin');
  }, [canAccess, isLoading, router, user]);

  if (isLoading) {
    return <LoadingFallback />;
  }

  if (!canAccess) {
    return null;
  }

  return children;
}
