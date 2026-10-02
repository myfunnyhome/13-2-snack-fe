import localFont from 'next/font/local';

export const suit = localFont({
  src: [
    { path: '../assets/fonts/SUIT-Regular.woff2', weight: '400' },
    { path: '../assets/fonts/SUIT-Bold.woff2', weight: '700' },
    { path: '../assets/fonts/SUIT-ExtraBold.woff2', weight: '800' },
  ],
  variable: '--font-suit',
});
