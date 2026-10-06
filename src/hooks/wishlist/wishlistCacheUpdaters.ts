import { type InfiniteData, type QueryClient } from '@tanstack/react-query';

import {
  type ProductDetail,
  type ProductListResponse,
} from '@/lib/services/productService';

// 카드·상세에 띄우는 찜 개수는 상품 응답에서 온다. 목록·상세를 통째로 다시 받으면
// 요청이 늘고 스크롤이 흔들리므로 캐시의 숫자만 1 올리거나 내린다.
// 찜 변경이 서버에 반영된 뒤(await setLiked 성공 후)에만 부른다.
export function adjustProductWishlistCount(
  queryClient: QueryClient,
  productId: number,
  delta: 1 | -1,
): void {
  queryClient.setQueriesData<InfiniteData<ProductListResponse>>(
    { queryKey: ['products'] },
    (cached) =>
      cached && {
        ...cached,
        pages: cached.pages.map((page) => ({
          ...page,
          products: page.products.map((item) =>
            item.id === productId
              ? {
                  ...item,
                  wishlistCount: Math.max(0, item.wishlistCount + delta),
                }
              : item,
          ),
        })),
      },
  );

  queryClient.setQueryData<ProductDetail>(
    ['product', productId],
    (cached) =>
      cached && {
        ...cached,
        wishlistCount: Math.max(0, cached.wishlistCount + delta),
      },
  );
}
