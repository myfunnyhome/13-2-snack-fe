import { Suspense } from 'react';

import type { Metadata } from 'next';

import PasswordResetForm from './_components/PasswordResetForm';

export const metadata: Metadata = {
  referrer: 'no-referrer',
};

export default function Page() {
  return (
    <Suspense fallback={null}>
      <PasswordResetForm />
    </Suspense>
  );
}
