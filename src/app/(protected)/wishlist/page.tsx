'use client';

import { useState } from 'react';

import { useWishlistProducts } from '@/hooks/wishlist/useWishlistProducts';
import { useWishlist } from '@/providers/WishlistProvider';

import WishlistNavigationBoundary from '../WishlistNavigationBoundary';

import WishlistScreen, {
  type PendingWishlistRemoval,
} from './WishlistScreen';

export default function WishlistPage() {
  const [pendingRemoval, setPendingRemoval] =
    useState<PendingWishlistRemoval | null>(null);
  const [isConfirmingRemoval, setIsConfirmingRemoval] = useState(false);
  const {
    items,
    isInitialLoading,
    isLoadingMore,
    error,
    hasNext,
    loadMore,
    revalidateLoadedRange,
  } = useWishlistProducts();
  const { isHydrated, isLiked, getMutationStatus, setLiked, hydrate } =
    useWishlist();

  async function handleLikeClick(
    productId: number,
    productName: string,
    isCurrentlyLiked: boolean,
  ): Promise<void> {
    if (getMutationStatus(productId) === 'pending') return;

    if (isCurrentlyLiked) {
      setPendingRemoval({ productId, productName });
      return;
    }

    try {
      if (!isHydrated) {
        await hydrate();
      }

      await setLiked(productId, true);
      await revalidateLoadedRange();
    } catch {
      return;
    }
  }

  function closeRemovalModal(): void {
    if (isConfirmingRemoval) return;
    setPendingRemoval(null);
  }

  async function confirmWishlistRemoval(): Promise<void> {
    if (!pendingRemoval || isConfirmingRemoval) return;

    setIsConfirmingRemoval(true);

    try {
      if (!isHydrated) {
        await hydrate();
      }

      await setLiked(pendingRemoval.productId, false);
      await revalidateLoadedRange();
      setPendingRemoval(null);
    } catch {
      return;
    } finally {
      setIsConfirmingRemoval(false);
    }
  }

  return (
    <WishlistNavigationBoundary>
      <WishlistScreen
        items={items}
        isInitialLoading={isInitialLoading}
        isLoadingMore={isLoadingMore}
        error={error}
        hasNext={hasNext}
        isHydrated={isHydrated}
        isLiked={isLiked}
        getMutationStatus={getMutationStatus}
        pendingRemoval={pendingRemoval}
        isConfirmingRemoval={isConfirmingRemoval}
        onLikeClick={(productId, productName, isCurrentlyLiked) => {
          void handleLikeClick(productId, productName, isCurrentlyLiked);
        }}
        onLoadMore={() => {
          void loadMore();
        }}
        onCloseRemovalModal={closeRemovalModal}
        onConfirmRemoval={() => {
          void confirmWishlistRemoval();
        }}
      />
    </WishlistNavigationBoundary>
  );
}
