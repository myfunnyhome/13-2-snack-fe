import type { PropsWithChildren } from 'react';

import Gnb from '@/components/ui/LogoGnb/Gnb';

export default function Layout({ children }: PropsWithChildren) {
  return (
    <div className="flex min-h-dvh flex-col">
      <Gnb variant="guest" />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-[1440px]">{children}</div>
      </main>
    </div>
  );
}
