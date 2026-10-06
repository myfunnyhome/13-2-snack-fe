'use client';

import { useCallback } from 'react';

import {
  type InfiniteData,
  useInfiniteQuery,
  useQueryClient,
} from '@tanstack/react-query';

import {
  type WishlistItem,
  type WishlistPage,
} from '@/lib/services/wishlistService';

import {
  WISHLIST_PAGE_SIZE,
  wishlistKeys,
  wishlistListQueryOptions,
} from './wishlistQueries';

type UseWishlistProductsResult = {
  items: WishlistItem[];
  isInitialLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  hasNext: boolean;
  loadMore: () => Promise<void>;
  revalidateLoadedRange: () => Promise<void>;
  removeItemFromCache: (productId: number) => void;
};

// 오프셋 페이지네이션이라 앞 페이지에서 찜이 빠지면 다음 페이지 상품이 당겨져
// 같은 상품이 두 페이지에 올 수 있다. id 기준으로 한 번만 남긴다.
function collectUniqueItems(pages: WishlistPage[]): WishlistItem[] {
  const seenIds = new Set<number>();
  const items: WishlistItem[] = [];

  pages.forEach((page) => {
    page.items.forEach((item) => {
      if (seenIds.has(item.id)) return;

      seenIds.add(item.id);
      items.push(item);
    });
  });

  return items;
}

// 컴포넌트 밖에 둬야 캐시가 바뀔 때만 select가 다시 계산된다.
function selectUniqueItems(data: InfiniteData<WishlistPage>): WishlistItem[] {
  return collectUniqueItems(data.pages);
}

export function useWishlistProducts(
  limit: number = WISHLIST_PAGE_SIZE,
): UseWishlistProductsResult {
  const queryClient = useQueryClient();
  const {
    data: items = [],
    isPending,
    isFetchingNextPage,
    error,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    ...wishlistListQueryOptions(limit),
    select: selectUniqueItems,
  });

  const loadMore = useCallback(async (): Promise<void> => {
    // fetchNextPage는 기본적으로 진행 중인 요청을 취소하고 새로 보낸다.
    // 이미 불러오는 중이면 아무것도 하지 않는다.
    if (!hasNextPage || isPending || isFetchingNextPage) return;

    await fetchNextPage({ cancelRefetch: false });
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, isPending]);

  // 불러온 페이지 범위를 서버 기준으로 다시 맞춘다. 화면을 막지 않도록
  // 호출하는 쪽에서 기다리지 않아도 된다(캐시된 카드는 그대로 보인다).
  const revalidateLoadedRange = useCallback(async (): Promise<void> => {
    await queryClient.invalidateQueries({ queryKey: wishlistKeys.lists() });
  }, [queryClient]);

  // 해제가 확정된 카드는 재조회를 기다리지 않고 캐시에서 바로 뺀다.
  const removeItemFromCache = useCallback(
    (productId: number): void => {
      queryClient.setQueriesData<InfiniteData<WishlistPage>>(
        { queryKey: wishlistKeys.lists() },
        (cached) =>
          cached && {
            ...cached,
            pages: cached.pages.map((page) => ({
              ...page,
              items: page.items.filter((item) => item.id !== productId),
            })),
          },
      );
    },
    [queryClient],
  );

  return {
    items,
    isInitialLoading: isPending,
    isLoadingMore: isFetchingNextPage,
    error: error ? error.message : null,
    hasNext: hasNextPage,
    loadMore,
    revalidateLoadedRange,
    removeItemFromCache,
  };
}
