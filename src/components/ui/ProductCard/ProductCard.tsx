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
  /** 찜한 사람 수. 넘기지 않으면 개수를 숨긴다. */
  wishlistCount?: number;
  onLikeClick?: () => void;
  className?: string;
  imageClassName?: string;
  likeButtonClassName?: string;
  /** 첫 화면에 보이는 카드면 true. 이미지를 지연 로딩하지 않고 먼저 받는다. */
  isImagePriority?: boolean;
};

const PRODUCT_CARD_IMAGE_SIZE = 340;

export default function ProductCard({
  imageSrc,
  imageAlt,
  name,
  price,
  purchaseCount,
  isLiked = false,
  wishlistCount,
  onLikeClick,
  className,
  imageClassName,
  likeButtonClassName,
  isImagePriority = false,
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
            isPriority={isImagePriority}
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
            // 피그마 기준 하트 위치: 모바일·태블릿 아이콘 20 / 여백 12, PC 아이콘 30 / 여백 20.
            // p-2(8px)를 뺀 값을 좌표로 준다. 찜 개수는 하트 왼쪽에 둬서
            // 개수가 붙어도 하트 자체는 시안 위치에 그대로 남는다.
            'absolute right-1 bottom-1 z-10 flex items-center gap-1 p-2 lg:right-3 lg:bottom-3',
            isLiked ? 'text-red' : 'text-primary-950',
            likeButtonClassName,
          )}
        >
          {wishlistCount !== undefined && (
            <span className="text-14-bold text-primary-700">
              {wishlistCount}
            </span>
          )}
          <HeartIcon isActive={isLiked} className="size-5 lg:size-[30px]" />
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
