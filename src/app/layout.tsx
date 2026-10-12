import type { Metadata } from 'next';

import SnackyLauncher from '@/components/ui/Snacky/SnackyLauncher';

import { suit } from './fonts';
import Providers from './providers';

import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://snack.storystore.cloud'),
  title: 'Snack',
  description: '기업 간식 구매 관리 서비스',
  openGraph: {
    title: 'Snack',
    description: '기업 간식 구매 관리 서비스',
  },
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="ko" className={`${suit.variable} min-h-full antialiased`}>
      <body className="min-h-dvh">
        <Providers>
          {children}
          <SnackyLauncher />
        </Providers>
      </body>
    </html>
  );
}
