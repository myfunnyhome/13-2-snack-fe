'use client';
import Image from 'next/image';

import likeIcon from '@/assets/icons/like.svg';
import likeActiveIcon from '@/assets/icons/like_active.svg';
import ProductImage from '@/components/ui/ProductImage/ProductImage';
import { cn } from '@/utils/cn';

type ProductCardProps = {
  imageSrc: string;
  imageAlt: string;
  name: string;
  price: number;
  purchaseCount: number;
  isLiked?: boolean;
  onLikeClick?: () => void;
  className?: string;
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
}: ProductCardProps) {
  return (
    <div className={cn('flex w-[340px] flex-col gap-3', className)}>
      <div className="relative">
        <ProductImage
          src={imageSrc}
          alt={imageAlt}
          size={PRODUCT_CARD_IMAGE_SIZE}
          background="bg-primary-50"
        />
        <button
          type="button"
          onClick={onLikeClick}
          aria-pressed={isLiked}
          aria-label={isLiked ? '찜 해제하기' : '찜하기'}
          className="absolute bottom-2 right-2"
        >
          <Image
            src={isLiked ? likeActiveIcon : likeIcon}
            alt=""
            aria-hidden
            width={24}
            height={24}
          />
        </button>
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex min-w-0 items-center gap-1">
          <span className="text-18-regular min-w-0 flex-1 truncate text-primary-950">
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
    </div>
  );
}
