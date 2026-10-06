'use client';

import ProductCard, {
  type ProductCardProps,
} from '@/components/ui/ProductCard/ProductCard';
import { useWishlistItem } from '@/providers/WishlistProvider';
import { cn } from '@/utils/cn';

type WishlistProductCardProps = Omit<
  ProductCardProps,
  'isLiked' | 'onLikeClick'
> & {
  productId: number;
  /** 찜 목록을 아직 못 불러왔을 때 보여줄 하트 상태. 넘기지 않으면 Provider 값을 그대로 쓴다. */
  isLikedBeforeHydrate?: boolean;
  /** 찜 변경 요청이 진행 중일 때 카드에 더할 클래스 */
  pendingClassName?: string;
  onLikeClick: (productId: number, isLiked: boolean) => void;
};

// 상품 하나의 찜 상태만 구독하는 카드.
// 목록 전체가 useWishlist()를 쓰면 하트 하나만 바뀌어도 카드가 전부 다시 그려지므로,
// 카드가 많은 목록에서는 이 컴포넌트로 바뀐 카드만 다시 렌더링한다.
export default function WishlistProductCard({
  productId,
  isLikedBeforeHydrate,
  pendingClassName,
  onLikeClick,
  className,
  ...cardProps
}: WishlistProductCardProps) {
  const { isHydrated, isLiked, mutationStatus } = useWishlistItem(productId);
  const isProductLiked =
    isHydrated || isLikedBeforeHydrate === undefined
      ? isLiked
      : isLikedBeforeHydrate;

  return (
    <ProductCard
      {...cardProps}
      className={cn(
        className,
        mutationStatus === 'pending' && pendingClassName,
      )}
      isLiked={isProductLiked}
      onLikeClick={() => onLikeClick(productId, isProductLiked)}
    />
  );
}
