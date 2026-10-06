'use client';

import { useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import { useWishlistProducts } from '@/hooks/wishlist/useWishlistProducts';
import { adjustProductWishlistCount } from '@/hooks/wishlist/wishlistCacheUpdaters';
import { useWishlistActions } from '@/providers/WishlistProvider';

import WishlistNavigationBoundary from '../WishlistNavigationBoundary';
import WishlistScreen, { type PendingWishlistRemoval } from './WishlistScreen';

export default function WishlistPage() {
  const queryClient = useQueryClient();
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
    removeItemFromCache,
  } = useWishlistProducts();
  // 찜 상태는 카드가 상품별로 구독한다. 이 페이지는 클릭 순간의 값만 읽으므로
  // 하트가 바뀌어도 페이지 전체가 다시 렌더링되지 않는다.
  const { getIsHydrated, getIsLiked, getMutationStatus, setLiked, hydrate } =
    useWishlistActions();

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
      if (!getIsHydrated()) {
        await hydrate();
      }

      const wasLiked = getIsLiked(productId);
      await setLiked(productId, true);

      if (!wasLiked) {
        adjustProductWishlistCount(queryClient, productId, 1);
      }
      // 서버 기준 재정렬은 뒤에서 한다. 카드는 캐시 그대로 보인다.
      void revalidateLoadedRange();
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

    const { productId } = pendingRemoval;
    setIsConfirmingRemoval(true);

    try {
      if (!getIsHydrated()) {
        await hydrate();
      }

      const wasLiked = getIsLiked(productId);
      await setLiked(productId, false);

      // 해제가 확정되면 카드를 바로 빼고 모달을 닫는다.
      removeItemFromCache(productId);
      if (wasLiked) {
        adjustProductWishlistCount(queryClient, productId, -1);
      }
      setPendingRemoval(null);
      // 앞 페이지에서 빠진 만큼 당겨지는 상품은 뒤에서 다시 맞춘다.
      void revalidateLoadedRange();
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
