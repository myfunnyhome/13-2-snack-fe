'use client';

import { useCallback, useMemo } from 'react';

import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';

import { ApiError } from '@/lib/services/fetchClient';
import {
  type WishlistItem,
  type WishlistPage,
  getWishlist,
} from '@/lib/services/wishlistService';
import { useWishlist } from '@/providers/WishlistProvider';

export const WISHLIST_QUERY_KEY = ['wishlist'] as const;

const DEFAULT_LIMIT = 6;

type UseWishlistProductsResult = {
  items: WishlistItem[];
  isInitialLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  hasNext: boolean;
  loadMore: () => Promise<void>;
  revalidateLoadedRange: () => Promise<void>;
  retry: () => Promise<void>;
};

// 4xx는 서버가 사용자에게 보여줄 문구를 보낸다.
// 그 외(서버가 꺼져 프록시가 낸 500, 네트워크 끊김)는 'API request failed: 500',
// 'Failed to fetch' 같은 개발용 문구라 화면에는 안내 문구를 보여준다.
function toErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
    return error.message;
  }

  return fallback;
}

// 찜을 해제하면 뒤 페이지 항목이 앞으로 당겨져서 같은 상품이 두 페이지에 걸쳐 올 수 있다.
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
  const queryClient = useQueryClient();
  const { prepareWishlistNavigation } = useWishlist();
  const queryKey = useMemo(() => [...WISHLIST_QUERY_KEY, { limit }], [limit]);

  const {
    data,
    isPending,
    isFetching,
    isFetchingNextPage,
    isRefetching,
    isError,
    isFetchNextPageError,
    isRefetchError,
    error,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam }) => {
      // 상품 리스트에서 하트를 누르고 바로 넘어오면 찜 요청이 아직 서버에 가는 중일 수 있다.
      // 그 요청이 끝난 뒤에 받아야 방금 찜한 상품이 목록에서 빠지지 않는다.
      if (pageParam === 1) {
        await prepareWishlistNavigation();
      }

      return getWishlist({ page: pageParam, limit });
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? lastPage.page + 1 : undefined,
  });

  const items = useMemo(() => collectUniqueItems(data?.pages ?? []), [data]);

  const loadMore = useCallback(async (): Promise<void> => {
    // 다시 받는 중에 다음 페이지를 붙이면 페이지 번호가 어긋나므로 기다린다.
    if (!hasNextPage || isFetching) return;

    await fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetching]);

  // 불러온 페이지 수만큼 1페이지부터 다시 받는다. 받는 동안 기존 목록은 그대로 보인다.
  const revalidateLoadedRange = useCallback(async (): Promise<void> => {
    await queryClient.invalidateQueries({ queryKey });
  }, [queryClient, queryKey]);

  // 어느 단계에서 실패했든 첫 페이지부터 다시 받는다.
  const retry = useCallback(async (): Promise<void> => {
    await queryClient.resetQueries({ queryKey });
  }, [queryClient, queryKey]);

  let errorMessage: string | null = null;
  if (isError) {
    if (isFetchNextPageError) {
      errorMessage = toErrorMessage(
        error,
        '찜 목록을 추가로 불러오지 못했습니다. 잠시 후 다시 시도해주세요.',
      );
    } else if (isRefetchError) {
      errorMessage = toErrorMessage(
        error,
        '찜 목록을 최신 상태로 맞추지 못했습니다. 잠시 후 다시 시도해주세요.',
      );
    } else {
      errorMessage = toErrorMessage(
        error,
        '찜 목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.',
      );
    }
  }

  return {
    items,
    isInitialLoading: isPending,
    isLoadingMore: isFetchingNextPage || isRefetching,
    error: errorMessage,
    hasNext: hasNextPage,
    loadMore,
    revalidateLoadedRange,
    retry,
  };
}
