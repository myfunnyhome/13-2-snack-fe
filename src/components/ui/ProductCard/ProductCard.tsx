'use client';

import { type MouseEvent } from 'react';

import HeartIcon from '@/components/icons/HeartIcon';
import ProductImage from '@/components/ui/ProductImage/ProductImage';
import { cn } from '@/utils/cn';

type ProductCardProps = {
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
  imageSrc,
  imageAlt,
  name,
  price,
  purchaseCount,
  isLiked = false,
  onLikeClick,
  className,
  imageClassName,
  likeButtonClassName,
}: ProductCardProps) {
  function handleLikeClick(event: MouseEvent<HTMLButtonElement>): void {
    event.preventDefault();
    event.stopPropagation();
    onLikeClick?.();
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
            'absolute right-2 bottom-2 z-10 p-2',
            isLiked ? 'text-red' : 'text-primary-950',
            likeButtonClassName,
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
