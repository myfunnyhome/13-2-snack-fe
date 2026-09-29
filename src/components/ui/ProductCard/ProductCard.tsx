'use client';

import { type MouseEvent } from 'react';

import HeartIcon from '@/components/icons/HeartIcon';
import ProductImage from '@/components/ui/ProductImage/ProductImage';
import { useToast } from '@/providers/ToastProvider';
import { useWishlist } from '@/providers/WishlistProvider';
import { cn } from '@/utils/cn';

/*
@ 상품 카드
- onLikeClick을 넘기면 찜 상태를 부모가 관리한다. (isLiked·onLikeClick으로 제어)
- onLikeClick 없이 productId만 넘기면 WishlistProvider에 직접 연결해 하트를 토글한다.
  낙관적 반영·서버 요청·실패 시 되돌리기는 Provider가 처리하고, 찜 페이지도 같은 상태를 본다.
*/

type ProductCardProps = {
  productId?: number;
  imageSrc?: string | null;
  imageAlt: string;
  name: string;
  price: number;
  purchaseCount: number;
  isLiked?: boolean;
  onLikeClick?: () => void;
  className?: string;
  imageClassName?: string;
  likeButtonClassName?: string;
};

const PRODUCT_CARD_IMAGE_SIZE = 340;

export default function ProductCard({
  productId,
  imageSrc,
  imageAlt,
  name,
  price,
  purchaseCount,
  isLiked: isLikedProp = false,
  onLikeClick,
  className,
  imageClassName,
  likeButtonClassName,
}: ProductCardProps) {
  const wishlist = useWishlist();
  const toast = useToast();
  const isWishlistConnected = !onLikeClick && productId !== undefined;
  const isLiked = isWishlistConnected
    ? wishlist.isLiked(productId)
    : isLikedProp;

  function toggleWishlist(targetProductId: number): void {
    // 같은 상품의 요청이 끝나기 전에는 중복 클릭을 막는다.
    if (wishlist.getMutationStatus(targetProductId) === 'pending') return;

    // setLiked는 실패하면 reject된다. 받지 않으면 처리되지 않은 에러가 된다.
    wishlist.setLiked(targetProductId, !isLiked).catch((error: unknown) => {
      toast.open({
        text:
          error instanceof Error
            ? error.message
            : '찜 상태를 변경하지 못했습니다.',
      });
    });
  }

  function handleLikeClick(event: MouseEvent<HTMLButtonElement>): void {
    event.preventDefault();
    event.stopPropagation();

    if (onLikeClick) {
      onLikeClick();
      return;
    }

    if (productId !== undefined) {
      toggleWishlist(productId);
    }
  }

  return (
    <article
      className={cn('flex w-full max-w-[340px] flex-col gap-3', className)}
    >
      <div className="relative w-full">
        {imageSrc ? (
          <ProductImage
            src={imageSrc}
            alt={imageAlt}
            size={PRODUCT_CARD_IMAGE_SIZE}
            background="bg-primary-50"
            hasMaxWidth={false}
            className={imageClassName}
          />
        ) : (
          <div
            className={cn('aspect-square w-full bg-primary-50', imageClassName)}
          />
        )}
        <button
          type="button"
          onClick={handleLikeClick}
          aria-pressed={isLiked}
          aria-label={isLiked ? '찜 해제하기' : '찜하기'}
          className={cn(
            'right-2 bottom-2 z-10 p-2',
            isLiked ? 'text-red' : 'text-primary-950',
            likeButtonClassName,
            // 하트는 항상 이미지 위에 떠 있어야 한다. likeButtonClassName에 relative 등이
            // 들어와도 tailwind-merge가 absolute를 지우지 않도록 마지막에 둔다.
            'absolute',
          )}
        >
          <HeartIcon isActive={isLiked} className="size-6" />
        </button>
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex min-w-0 items-center gap-1">
          <span className="text-18-regular min-w-0 truncate text-primary-950">
            {name}
          </span>
          <span className="text-14-bold shrink-0 text-secondary-500">
            {purchaseCount}회 구매
          </span>
        </div>
        <p className="text-18-extrabold text-primary-950">
          {price.toLocaleString('ko-KR')}원
        </p>
      </div>
    </article>
  );
}

export type { ProductCardProps };
