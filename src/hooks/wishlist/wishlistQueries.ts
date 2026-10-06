import { infiniteQueryOptions } from '@tanstack/react-query';

import { getWishlist } from '@/lib/services/wishlistService';

// 백엔드 기본값은 6이라 요청마다 limit을 꼭 붙여야 12가 적용된다(최대 100).
export const WISHLIST_PAGE_SIZE = 12;
const WISHLIST_STALE_TIME = 1000 * 30;

// 찜 쿼리 키는 여기서만 만든다. ['wishlist']로 시작해야 로그아웃 때
// AuthProvider.clearSessionCache가 다른 쿼리와 함께 지운다.
export const wishlistKeys = {
  all: ['wishlist'] as const,
  lists: () => [...wishlistKeys.all, 'list'] as const,
  list: (limit: number) => [...wishlistKeys.lists(), { limit }] as const,
};

// 훅과 GNB 프리페치가 같은 옵션을 써야 캐시를 공유한다.
export function wishlistListQueryOptions(limit: number = WISHLIST_PAGE_SIZE) {
  return infiniteQueryOptions({
    queryKey: wishlistKeys.list(limit),
    queryFn: ({ pageParam }) => getWishlist({ page: pageParam, limit }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? lastPage.page + 1 : undefined,
    staleTime: WISHLIST_STALE_TIME,
    // 무한 스크롤은 포커스 재조회 때 불러온 페이지를 전부 다시 받는다.
    refetchOnWindowFocus: false,
  });
}
