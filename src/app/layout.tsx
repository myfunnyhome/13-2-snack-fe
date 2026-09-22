import type { Metadata } from 'next';
import localFont from 'next/font/local';

import Providers from './providers';

import './globals.css';

const suit = localFont({
  src: [
    { path: '../assets/fonts/SUIT-Regular.woff2', weight: '400' },
    { path: '../assets/fonts/SUIT-Bold.woff2', weight: '700' },
    { path: '../assets/fonts/SUIT-ExtraBold.woff2', weight: '800' },
  ],
  variable: '--font-suit',
});

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
