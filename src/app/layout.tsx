import type { Metadata } from 'next';

import { suit } from './fonts';
import Providers from './providers';

import './globals.css';

export const metadata: Metadata = {
  title: 'Snack',
  description: '기업 간식 구매 관리 서비스',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`${suit.variable} min-h-full antialiased`}>
      <body className="min-h-dvh">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
