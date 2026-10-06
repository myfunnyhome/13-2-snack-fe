'use client';

import { useCallback, useMemo } from 'react';

import { useInfiniteQuery } from '@tanstack/react-query';

import {
  type WishlistItem,
  type WishlistPage,
  getWishlist,
} from '@/lib/services/wishlistService';
import { getErrorMessage } from '@/utils/getErrorMessage';

import { wishlistQueryKeys } from './wishlistQueryKeys';

const DEFAULT_LIMIT = 6;

type UseWishlistProductsResult = {
  items: WishlistItem[];
  isInitialLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  hasNext: boolean;
  loadMore: () => Promise<void>;
};

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

export function useWishlistProducts(
  limit: number = DEFAULT_LIMIT,
): UseWishlistProductsResult {
  const {
    data,
    error,
    hasNextPage,
    isPending,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: wishlistQueryKeys.products(limit),
    queryFn: ({ pageParam }) => getWishlist({ page: pageParam, limit }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? lastPage.page + 1 : undefined,
  });

  // 다른 요청(첫 페이지·찜 변경 후 재조회)이 진행 중이면 다음 페이지를 부르지 않는다.
  // fetchNextPage는 기본적으로 진행 중인 요청을 취소하고 다시 보내기 때문이다.
  const loadMore = useCallback(async (): Promise<void> => {
    if (!hasNextPage || isFetching) return;

    await fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetching]);

  const items = useMemo(() => collectUniqueItems(data?.pages ?? []), [data]);

  return {
    items,
    isInitialLoading: isPending,
    isLoadingMore: isFetchingNextPage,
    error: error
      ? getErrorMessage(error, '찜 목록을 불러오지 못했습니다.')
      : null,
    hasNext: hasNextPage,
    loadMore,
  };
}
