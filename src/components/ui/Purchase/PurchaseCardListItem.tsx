import Image from 'next/image';

import NoImage from '@/assets/images/no_image.png';
import ProductImage from '@/components/ui/ProductImage/ProductImage';

type PurchaseCardListItemProps = {
  imageSrc: string | null;
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

export default function PurchaseCardListItem({
  imageSrc,
  imageAlt,
  name,
  price,
  purchaseCount,
}: PurchaseCardListItemProps) {
  return (
    <div className="flex gap-[20px] p-[20px] pl-0 border-b border-primary-100">
      {imageSrc === null ? (
        <Image
          src={NoImage}
          alt="상품 이미지 없음"
          className="w-[140px] h-[140px]"
        />
      ) : (
        <ProductImage
          src={imageSrc}
          alt={imageAlt}
          size={PRODUCT_CARD_IMAGE_SIZE}
          background="bg-primary-50"
          className="w-[140px] h-[140px]"
        />
      )}
      <div className="flex flex-1 justify-between items-center">
        <div className="flex flex-col">
          <h1 className="text-16-regular text-primary-900 mb-[10px]">{name}</h1>
          <p className="text-16-bold text-primary-900 mb-[30px]">
            {price.toLocaleString()}원
          </p>
          <p className="text-16-bold text-primary-500">
            수량 {purchaseCount}개
          </p>
        </div>
        <p className="text-16-extrabold text-primary-700">
          {(price * purchaseCount).toLocaleString()}원
        </p>
      </div>
    </div>
  );
}
