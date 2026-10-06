'use client';

import { useEffect } from 'react';

import { ExclamationIcon } from '@/components/icons';
import Fallback from '@/components/ui/Fallback/Fallback';

import { suit } from './fonts';

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en" className={`${suit.variable} min-h-full antialiased`}>
      <body className="min-h-dvh">
        <Fallback
          icon={<ExclamationIcon className="size-[70px] text-red" />}
          title="문제가 발생했어요"
          description="잠시 후 다시 시도해주세요"
          actionText="다시 시도"
          onAction={() => window.location.reload()}
        />
      </body>
    </html>
  );
}
