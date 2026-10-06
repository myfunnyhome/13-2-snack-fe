'use client';

import { type PropsWithChildren, useEffect } from 'react';

import { useRouter } from 'next/navigation';

import { useWishlist } from '@/providers/WishlistProvider';

function isModifiedClick(event: MouseEvent): boolean {
  return (
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  );
}

export default function WishlistNavigationBoundary({
  children,
}: PropsWithChildren) {
  const router = useRouter();
  const { prepareWishlistNavigation } = useWishlist();

  useEffect(() => {
    function handleClick(event: MouseEvent): void {
      if (isModifiedClick(event)) return;
      if (!(event.target instanceof Element)) return;
      if (event.target.closest('button')) return;

      const anchor = event.target.closest<HTMLAnchorElement>('a[href]');
      if (!anchor) return;
      if (anchor.target && anchor.target !== '_self') return;
      if (anchor.hasAttribute('download')) return;

      const destination = new URL(anchor.href, window.location.href);
      if (destination.origin !== window.location.origin) return;
      if (destination.pathname === window.location.pathname) return;

      event.preventDefault();
      event.stopPropagation();

      const targetPath = `${destination.pathname}${destination.search}${destination.hash}`;
      void prepareWishlistNavigation().finally(() => {
        router.push(targetPath);
      });
    }

    document.addEventListener('click', handleClick, true);

    return () => {
      document.removeEventListener('click', handleClick, true);
    };
  }, [prepareWishlistNavigation, router]);

  useEffect(() => {
    return () => {
      void prepareWishlistNavigation();
    };
  }, [prepareWishlistNavigation]);

  return children;
}
