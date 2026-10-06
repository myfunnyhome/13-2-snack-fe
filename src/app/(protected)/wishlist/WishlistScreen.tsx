'use client';

import { useEffect, useRef } from 'react';

import Link from 'next/link';

import ChevronIcon from '@/components/icons/ChevronIcon';
import Button from '@/components/ui/Button/Button';
import { Modal } from '@/components/ui/Modal';
import ProductCard from '@/components/ui/ProductCard/ProductCard';
import { type WishlistItem } from '@/lib/services/wishlistService';
import { type WishlistMutationStatus } from '@/providers/WishlistProvider';
import { cn } from '@/utils/cn';

type PendingWishlistRemoval = {
  productId: number;
  productName: string;
};

type WishlistScreenProps = {
  items: WishlistItem[];
  isInitialLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  hasNext: boolean;
  isHydrated: boolean;
  isLiked: (productId: number) => boolean;
  getMutationStatus: (productId: number) => WishlistMutationStatus;
  pendingRemoval: PendingWishlistRemoval | null;
  isConfirmingRemoval: boolean;
  onLikeClick: (
    productId: number,
    productName: string,
    isCurrentlyLiked: boolean,
  ) => void;
  onLoadMore: () => void;
  onCloseRemovalModal: () => void;
  onConfirmRemoval: () => void;
};

export default function WishlistScreen({
  items,
  isInitialLoading,
  isLoadingMore,
  error,
  hasNext,
  isHydrated,
  isLiked,
  getMutationStatus,
  pendingRemoval,
  isConfirmingRemoval,
  onLikeClick,
  onLoadMore,
  onCloseRemovalModal,
  onConfirmRemoval,
}: WishlistScreenProps) {
  const hasMutationError = items.some(
    (item) => getMutationStatus(item.id) === 'error',
  );
  const hasVisibleItems = items.length > 0;
  const isEmpty = !isInitialLoading && !error && !hasVisibleItems;
  const loadMoreSentinelRef = useRef<HTMLDivElement>(null);
  const onLoadMoreRef = useRef(onLoadMore);

  useEffect(() => {
    onLoadMoreRef.current = onLoadMore;
  }, [onLoadMore]);

  useEffect(() => {
    const sentinel = loadMoreSentinelRef.current;
    if (!sentinel || !hasNext || isInitialLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          onLoadMoreRef.current();
        }
      },
      { rootMargin: '240px 0px' },
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [hasNext, isInitialLoading, items.length]);

  function scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="flex flex-col gap-4 px-6 pt-6 pb-16 md:gap-6 md:px-8 md:pt-10 lg:px-[110px] lg:pt-12">
      <div className="border-b border-primary-100 pb-4 md:pb-6">
        <h1 className="text-20-bold text-primary-950 md:text-24-bold">
          나의 찜목록
        </h1>
      </div>

      {error ? (
        <p role="alert" className="text-14-regular text-error">
          {error}
        </p>
      ) : null}

      {hasMutationError ? (
        <p role="alert" className="text-14-regular text-error">
          일부 찜 상태를 변경하지 못했습니다. 다시 시도해주세요.
        </p>
      ) : null}

      {isInitialLoading ? (
        <p className="py-12 text-center text-14-regular text-primary-500">
          찜 목록을 불러오는 중...
        </p>
      ) : null}

      {isEmpty ? (
        <p className="py-16 text-center text-16-regular text-primary-500">
          찜한 상품이 없습니다.
        </p>
      ) : null}

      {hasVisibleItems ? (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 md:gap-x-6 md:gap-y-10 lg:gap-x-12 lg:gap-y-16">
          {items.map((product) => {
            const isProductLiked = isHydrated ? isLiked(product.id) : true;
            const isLikePending = getMutationStatus(product.id) === 'pending';

            return (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="block"
              >
                <ProductCard
                  imageSrc={product.imageUrl}
                  imageAlt={product.name}
                  name={product.name}
                  price={product.price}
                  purchaseCount={product.purchaseCount}
                  isLiked={isProductLiked}
                  onLikeClick={() => {
                    onLikeClick(product.id, product.name, isProductLiked);
                  }}
                  className={cn('max-w-none', isLikePending && 'opacity-70')}
                  imageClassName="max-w-none"
                />
              </Link>
            );
          })}
        </div>
      ) : null}

      {hasNext ? (
        <div ref={loadMoreSentinelRef} className="flex justify-center py-6">
          {isLoadingMore ? (
            <p className="text-14-regular text-primary-500">불러오는 중...</p>
          ) : null}
        </div>
      ) : null}

      {hasVisibleItems ? (
        <button
          type="button"
          onClick={scrollToTop}
          aria-label="맨 위로 이동"
          className="fixed right-6 bottom-6 z-40 flex size-12 items-center justify-center rounded-full border border-primary-100 bg-white text-primary-950 md:right-8 md:bottom-8 lg:right-[110px]"
        >
          <ChevronIcon direction="up" className="size-5" />
        </button>
      ) : null}

      <Modal isOpen={pendingRemoval !== null} onClose={onCloseRemovalModal}>
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="wishlist-removal-title"
          aria-describedby="wishlist-removal-description"
          className="flex w-[90vw] max-w-[327px] flex-col gap-9 rounded-md bg-white px-5 pt-[30px] pb-5 drop-shadow-[0_0_15px_rgba(0,0,0,0.14)] md:max-w-[512px] md:px-[30px] md:pt-10 md:pb-[30px]"
        >
          <div className="flex flex-col items-center gap-2 text-center">
            <h2
              id="wishlist-removal-title"
              className="text-16-bold text-primary-950 md:text-18-bold"
            >
              찜 목록에서 제외하시겠어요?
            </h2>
            <p
              id="wishlist-removal-description"
              className="text-14-regular text-primary-900 md:text-16-regular"
            >
              {pendingRemoval?.productName}의 찜을 해제합니다.
            </p>
          </div>

          <div className="flex w-full items-center gap-2.5 md:gap-5">
            <Button
              text="취소"
              variant="secondary"
              disabled={isConfirmingRemoval}
              onClick={onCloseRemovalModal}
              className="h-auto flex-1 py-[17px] text-14-bold md:py-[23px] md:text-16-bold"
            />
            <Button
              text={isConfirmingRemoval ? '처리 중...' : '찜 해제'}
              disabled={isConfirmingRemoval}
              onClick={onConfirmRemoval}
              className="h-auto flex-1 border border-transparent py-[17px] text-14-bold md:py-[23px] md:text-16-bold"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}

export type { PendingWishlistRemoval };
