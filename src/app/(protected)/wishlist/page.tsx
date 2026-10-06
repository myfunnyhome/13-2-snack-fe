'use client';

import { useState } from 'react';

import { useWishlistLikeMutation } from '@/hooks/wishlist/useWishlistLikeMutation';
import { useWishlistProducts } from '@/hooks/wishlist/useWishlistProducts';
import { useWishlist } from '@/providers/WishlistProvider';

import WishlistNavigationBoundary from '../WishlistNavigationBoundary';
import WishlistScreen, { type PendingWishlistRemoval } from './WishlistScreen';

export default function WishlistPage() {
  const [pendingRemoval, setPendingRemoval] =
    useState<PendingWishlistRemoval | null>(null);
  const { items, isInitialLoading, isLoadingMore, error, hasNext, loadMore } =
    useWishlistProducts();
  const { isHydrated, isLiked, getMutationStatus } = useWishlist();
  // 모달의 "처리 중" 상태가 다시 찜하기 요청에 섞이지 않게 둘을 나눈다.
  const likeMutation = useWishlistLikeMutation();
  const removalMutation = useWishlistLikeMutation();
  const isConfirmingRemoval = removalMutation.isPending;

  function handleLikeClick(
    productId: number,
    productName: string,
    isCurrentlyLiked: boolean,
  ): void {
    if (getMutationStatus(productId) === 'pending') return;

    if (isCurrentlyLiked) {
      setPendingRemoval({ productId, productName });
      return;
    }

    likeMutation.mutate({ productId, liked: true });
  }

  function closeRemovalModal(): void {
    if (isConfirmingRemoval) return;
    setPendingRemoval(null);
  }

  function confirmWishlistRemoval(): void {
    if (!pendingRemoval || isConfirmingRemoval) return;

    removalMutation.mutate(
      { productId: pendingRemoval.productId, liked: false },
      {
        onSuccess: () => {
          setPendingRemoval(null);
        },
      },
    );
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
        onLikeClick={handleLikeClick}
        onLoadMore={() => {
          void loadMore();
        }}
        onCloseRemovalModal={closeRemovalModal}
        onConfirmRemoval={confirmWishlistRemoval}
      />
    </WishlistNavigationBoundary>
  );
}
