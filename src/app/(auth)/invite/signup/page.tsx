import { Suspense } from 'react';

import InvitationSignupForm from './_components/InvitationSignupForm';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <InvitationSignupForm />
    </Suspense>
  );
}
