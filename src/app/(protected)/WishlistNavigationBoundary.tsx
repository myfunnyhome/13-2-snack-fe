'use client';

import { type PropsWithChildren, useEffect } from 'react';

import { useIsMutating } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import { wishlistQueryKeys } from '@/hooks/wishlist/wishlistQueryKeys';
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
  const pendingWishlistMutationCount = useIsMutating({
    mutationKey: wishlistQueryKeys.change(),
  });

  // 진행 중인 찜 요청이 있을 때만 링크 이동을 잠시 붙잡는다.
  // 요청이 없으면 Link가 원래대로 이동한다.
  useEffect(() => {
    if (pendingWishlistMutationCount === 0) return;

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
  }, [pendingWishlistMutationCount, prepareWishlistNavigation, router]);

  useEffect(() => {
    return () => {
      void prepareWishlistNavigation();
    };
  }, [prepareWishlistNavigation]);

  return children;
}
