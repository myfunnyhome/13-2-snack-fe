'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { type WishlistItem, getWishlist } from '@/lib/services/wishlistService';

const DEFAULT_LIMIT = 6;

type UseWishlistProductsResult = {
  items: WishlistItem[];
  isInitialLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  hasNext: boolean;
  loadMore: () => Promise<void>;
  reload: () => Promise<void>;
  revalidateLoadedRange: () => Promise<void>;
};

export function useWishlistProducts(
  limit: number = DEFAULT_LIMIT,
): UseWishlistProductsResult {
  const [cardsById, setCardsById] = useState<Map<number, WishlistItem>>(
    () => new Map(),
  );
  const [orderedIds, setOrderedIds] = useState<number[]>([]);
  const [loadedPageCount, setLoadedPageCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestGenerationRef = useRef(0);
  const isLoadingMoreRef = useRef(false);

  const mergeItems = useCallback((incomingItems: WishlistItem[]): void => {
    setCardsById((currentCards) => {
      const nextCards = new Map(currentCards);
      incomingItems.forEach((item) => nextCards.set(item.id, item));
      return nextCards;
    });
    setOrderedIds((currentIds) => {
      const knownIds = new Set(currentIds);
      const nextIds = [...currentIds];

      incomingItems.forEach((item) => {
        if (!knownIds.has(item.id)) {
          knownIds.add(item.id);
          nextIds.push(item.id);
        }
      });

      return nextIds;
    });
  }, []);

  const reload = useCallback(async (): Promise<void> => {
    const generation = requestGenerationRef.current + 1;
    requestGenerationRef.current = generation;
    setIsInitialLoading(true);
    setError(null);

    try {
      const result = await getWishlist({ page: 1, limit });
      if (generation !== requestGenerationRef.current) return;

      setCardsById(new Map(result.items.map((item) => [item.id, item])));
      setOrderedIds(result.items.map((item) => item.id));
      setLoadedPageCount(1);
      setHasNext(result.hasNext);
    } catch (fetchError) {
      if (generation !== requestGenerationRef.current) return;

      setError(
        fetchError instanceof Error
          ? fetchError.message
          : '찜 목록을 불러오지 못했습니다.',
      );
    } finally {
      if (generation === requestGenerationRef.current) {
        setIsInitialLoading(false);
      }
    }
  }, [limit]);

  useEffect(() => {
    async function loadInitialPage(): Promise<void> {
      await reload();
    }

    void loadInitialPage();

    return () => {
      requestGenerationRef.current += 1;
    };
  }, [reload]);

  const loadMore = useCallback(async (): Promise<void> => {
    if (!hasNext || isInitialLoading || isLoadingMoreRef.current) return;

    const generation = requestGenerationRef.current;
    const targetPage = loadedPageCount + 1;
    isLoadingMoreRef.current = true;
    setIsLoadingMore(true);
    setError(null);

    try {
      const result = await getWishlist({ page: targetPage, limit });
      if (generation !== requestGenerationRef.current) return;

      mergeItems(result.items);
      setLoadedPageCount(result.page);
      setHasNext(result.hasNext);
    } catch (fetchError) {
      if (generation !== requestGenerationRef.current) return;

      setError(
        fetchError instanceof Error
          ? fetchError.message
          : '찜 목록을 추가로 불러오지 못했습니다.',
      );
    } finally {
      if (generation === requestGenerationRef.current) {
        isLoadingMoreRef.current = false;
        setIsLoadingMore(false);
      }
    }
  }, [hasNext, isInitialLoading, limit, loadedPageCount, mergeItems]);

  const revalidateLoadedRange = useCallback(async (): Promise<void> => {
    if (loadedPageCount === 0) return;

    const generation = requestGenerationRef.current + 1;
    requestGenerationRef.current = generation;
    isLoadingMoreRef.current = true;
    setIsLoadingMore(true);
    setError(null);

    try {
      const pages = await Promise.all(
        Array.from({ length: loadedPageCount }, (_, index) =>
          getWishlist({ page: index + 1, limit }),
        ),
      );
      if (generation !== requestGenerationRef.current) return;

      pages.forEach((page) => mergeItems(page.items));
      const lastPage = pages.at(-1);
      setHasNext(lastPage?.hasNext ?? false);
    } catch (fetchError) {
      if (generation !== requestGenerationRef.current) return;

      setError(
        fetchError instanceof Error
          ? fetchError.message
          : '찜 목록을 최신 상태로 맞추지 못했습니다.',
      );
    } finally {
      if (generation === requestGenerationRef.current) {
        isLoadingMoreRef.current = false;
        setIsLoadingMore(false);
      }
    }
  }, [limit, loadedPageCount, mergeItems]);

  const items = useMemo(
    () =>
      orderedIds.flatMap((productId) => {
        const item = cardsById.get(productId);
        return item ? [item] : [];
      }),
    [cardsById, orderedIds],
  );

  return {
    items,
    isInitialLoading,
    isLoadingMore,
    error,
    hasNext,
    loadMore,
    reload,
    revalidateLoadedRange,
  };
}
