import RoleGuard from '@/components/auth/RoleGuard';

import ProfileForm from './_components/ProfileForm';

export default function Page() {
  return (
    <RoleGuard allowedRoles={['SUPER_ADMIN', 'ADMIN', 'GENERAL']}>
      <ProfileForm />
    </RoleGuard>
  );
}
