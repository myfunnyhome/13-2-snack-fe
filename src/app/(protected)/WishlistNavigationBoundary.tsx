'use client';

import { type MouseEvent, type PropsWithChildren } from 'react';

import { usePathname, useRouter } from 'next/navigation';

import { useWishlist } from '@/providers/WishlistProvider';

function isModifiedClick(event: MouseEvent<HTMLDivElement>): boolean {
  return (
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  );
}

function isCategorySelection(button: HTMLButtonElement): boolean {
  const categoryToggle = button.parentElement?.querySelector(
    ':scope > button[aria-expanded]',
  );

  return categoryToggle != null && categoryToggle !== button;
}

export default function WishlistNavigationBoundary({
  children,
}: PropsWithChildren) {
  const pathname = usePathname();
  const router = useRouter();
  const { prepareWishlistNavigation } = useWishlist();

  function handleClickCapture(event: MouseEvent<HTMLDivElement>): void {
    if (pathname !== '/wishlist' || isModifiedClick(event)) return;
    if (!(event.target instanceof Element)) return;

    const anchor = event.target.closest<HTMLAnchorElement>('a[href]');

    if (anchor) {
      if (anchor.target && anchor.target !== '_self') return;
      if (anchor.hasAttribute('download')) return;

      const destination = new URL(anchor.href, window.location.href);
      if (destination.origin !== window.location.origin) return;
      if (destination.pathname === pathname) return;

      event.preventDefault();
      event.stopPropagation();

      const targetPath = `${destination.pathname}${destination.search}${destination.hash}`;
      void prepareWishlistNavigation().finally(() => {
        router.push(targetPath);
      });
      return;
    }

    const button = event.target.closest<HTMLButtonElement>('header button');
    if (!button) return;

    if (
      isCategorySelection(button) ||
      button.textContent?.trim() === '로그아웃'
    ) {
      void prepareWishlistNavigation();
    }
  }

  return <div onClickCapture={handleClickCapture}>{children}</div>;
}
