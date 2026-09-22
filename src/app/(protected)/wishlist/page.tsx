'use client';

import { useEffect, useMemo, useState } from 'react';

import Button from '@/components/ui/Button/Button';
import { Modal } from '@/components/ui/Modal';
import ProductCard from '@/components/ui/ProductCard/ProductCard';
import { useWishlistProducts } from '@/hooks/wishlist/useWishlistProducts';
import { useWishlist } from '@/providers/WishlistProvider';

const PAGE_SIZE = 6;
const FALLBACK_IMAGE_PATH = '/file.svg';

type PendingWishlistRemoval = {
  productId: number;
  productName: string;
};

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
  } = useWishlistProducts(PAGE_SIZE);
  const {
    isHydrated,
    wishlistViewPhase,
    isLiked,
    getMutationStatus,
    setLiked,
    hydrate,
    enterWishlistView,
  } = useWishlist();

  useEffect(() => {
    enterWishlistView();
  }, [enterWishlistView]);

  const visibleItems = useMemo(
    () =>
      wishlistViewPhase === 'leaving' && isHydrated
        ? items.filter((item) => isLiked(item.id))
        : items,
    [isHydrated, isLiked, items, wishlistViewPhase],
  );
  const hasMutationError = items.some(
    (item) => getMutationStatus(item.id) === 'error',
  );

  async function handleLikeClick(
    productId: number,
    productName: string,
    currentlyLiked: boolean,
  ): Promise<void> {
    if (getMutationStatus(productId) === 'pending') return;

    if (currentlyLiked) {
      setPendingRemoval({ productId, productName });
      return;
    }

    if (!isHydrated) {
      await hydrate();
    }

    await setLiked(productId, true);
    await revalidateLoadedRange();
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
    } finally {
      setIsConfirmingRemoval(false);
    }
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

      {!isInitialLoading && visibleItems.length === 0 ? (
        <p className="py-16 text-center text-16-regular text-primary-500">
          찜한 상품이 없습니다.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 md:gap-x-6 md:gap-y-10 lg:gap-x-12 lg:gap-y-16">
          {visibleItems.map((product) => {
            const liked = isHydrated ? isLiked(product.id) : true;
            const isLikePending = getMutationStatus(product.id) === 'pending';

            return (
              <ProductCard
                key={product.id}
                imageSrc={product.imageUrl ?? FALLBACK_IMAGE_PATH}
                imageAlt={product.name}
                name={product.name}
                price={product.price}
                purchaseCount={product.purchaseCount}
                isLiked={liked}
                onLikeClick={() => {
                  void handleLikeClick(product.id, product.name, liked);
                }}
                className={
                  isLikePending ? 'max-w-none opacity-70' : 'max-w-none'
                }
                imageClassName="max-w-none"
              />
            );
          })}
        </div>
      )}

      {isInitialLoading ? (
        <p className="py-12 text-center text-14-regular text-primary-500">
          찜 목록을 불러오는 중...
        </p>
      ) : null}

      {hasNext ? (
        <Button
          text={isLoadingMore ? '불러오는 중...' : '더보기'}
          variant="secondary"
          disabled={isLoadingMore}
          onClick={() => {
            void loadMore();
          }}
          className="h-14 border-primary-100 text-14-regular text-primary-500 disabled:cursor-not-allowed disabled:opacity-60"
        />
      ) : null}

      <Modal isOpen={pendingRemoval !== null} onClose={closeRemovalModal}>
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
              onClick={closeRemovalModal}
              className="h-auto flex-1 py-[17px] text-14-bold md:py-[23px] md:text-16-bold"
            />
            <Button
              text={isConfirmingRemoval ? '처리 중...' : '찜 해제'}
              disabled={isConfirmingRemoval}
              onClick={() => {
                void confirmWishlistRemoval();
              }}
              className="h-auto flex-1 border border-transparent py-[17px] text-14-bold md:py-[23px] md:text-16-bold"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
