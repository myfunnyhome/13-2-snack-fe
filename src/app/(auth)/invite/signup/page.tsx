import { Suspense } from 'react';

import LoadingFallback from '@/components/ui/LoadingFallback/LoadingFallback';

import InvitationSignupForm from './_components/InvitationSignupForm';

export default function Page() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <InvitationSignupForm />
    </Suspense>
  );
}
