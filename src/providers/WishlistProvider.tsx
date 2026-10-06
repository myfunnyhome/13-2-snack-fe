'use client';

import {
  type PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';

import { useQueryClient } from '@tanstack/react-query';

import { wishlistKeys } from '@/hooks/wishlist/wishlistQueries';
import {
  addWishlistItem,
  getWishlistIds,
  removeWishlistItem,
} from '@/lib/services/wishlistService';
import { useAuth } from '@/providers/AuthProvider';

type WishlistMutationStatus = 'idle' | 'pending' | 'error';

type WishlistContextValue = {
  isHydrated: boolean;
  isLiked: (productId: number) => boolean;
  getMutationStatus: (productId: number) => WishlistMutationStatus;
  setLiked: (productId: number, liked: boolean) => Promise<void>;
  hydrate: () => Promise<void>;
  prepareWishlistNavigation: () => Promise<void>;
};

// 찜 상태가 바뀌어도 값이 바뀌지 않는 구독용 저장소.
// useWishlist()는 찜이 하나만 바뀌어도 쓰는 컴포넌트가 전부 다시 렌더링되므로,
// 카드가 많은 화면은 이 저장소를 상품별로 구독해 바뀐 카드만 다시 그린다.
type WishlistStore = {
  subscribe: (listener: () => void) => () => void;
  getIsHydrated: () => boolean;
  getIsLiked: (productId: number) => boolean;
  getMutationStatus: (productId: number) => WishlistMutationStatus;
  setLiked: (productId: number, liked: boolean) => Promise<void>;
  hydrate: () => Promise<void>;
};

type WishlistItemState = {
  isHydrated: boolean;
  isLiked: boolean;
  mutationStatus: WishlistMutationStatus;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);
const WishlistStoreContext = createContext<WishlistStore | null>(null);
const STORAGE_KEY_PREFIX = 'snack:wishlist-intent:';

function updateProductIdSet(
  currentIds: ReadonlySet<number>,
  productId: number,
  liked: boolean,
): Set<number> {
  const nextIds = new Set(currentIds);

  if (liked) {
    nextIds.add(productId);
  } else {
    nextIds.delete(productId);
  }

  return nextIds;
}

function readStoredIntentions(storageKey: string | null): Map<number, boolean> {
  if (!storageKey || typeof window === 'undefined') return new Map();

  try {
    const storedValue = window.sessionStorage.getItem(storageKey);
    if (!storedValue) return new Map();

    const parsedValue = JSON.parse(storedValue) as Record<string, unknown>;
    const intentions = new Map<number, boolean>();

    Object.entries(parsedValue).forEach(([productIdValue, liked]) => {
      const productId = Number(productIdValue);

      if (
        Number.isInteger(productId) &&
        productId > 0 &&
        typeof liked === 'boolean'
      ) {
        intentions.set(productId, liked);
      }
    });

    return intentions;
  } catch {
    window.sessionStorage.removeItem(storageKey);
    return new Map();
  }
}

export default function WishlistProvider({ children }: PropsWithChildren) {
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuth();
  const storageKey = user?.email
    ? `${STORAGE_KEY_PREFIX}${encodeURIComponent(user.email)}`
    : null;
  const [likedProductIds, setLikedProductIds] = useState<Set<number>>(
    () => new Set(),
  );
  const [isHydrated, setIsHydrated] = useState(false);
  const [mutationStatusByProductId, setMutationStatusByProductId] = useState<
    Map<number, WishlistMutationStatus>
  >(() => new Map());

  const likedProductIdsRef = useRef<Set<number>>(new Set());
  const confirmedProductIdsRef = useRef<Set<number>>(new Set());
  const desiredByProductIdRef = useRef<Map<number, boolean>>(new Map());
  const inFlightByProductIdRef = useRef<Map<number, Promise<void>>>(new Map());
  const mutationVersionByProductIdRef = useRef<Map<number, number>>(new Map());
  const hydratePromiseRef = useRef<Promise<void> | null>(null);
  const authGenerationRef = useRef(0);
  const storageKeyRef = useRef<string | null>(storageKey);
  const isHydratedRef = useRef(false);
  const mutationStatusByProductIdRef = useRef<
    Map<number, WishlistMutationStatus>
  >(new Map());
  const listenersRef = useRef<Set<() => void>>(new Set());

  const notifyListeners = useCallback((): void => {
    listenersRef.current.forEach((listener) => listener());
  }, []);

  const subscribe = useCallback((listener: () => void): (() => void) => {
    listenersRef.current.add(listener);

    return () => {
      listenersRef.current.delete(listener);
    };
  }, []);

  const replaceLikedProductIds = useCallback(
    (productIds: Set<number>): void => {
      likedProductIdsRef.current = productIds;
      setLikedProductIds(productIds);
      notifyListeners();
    },
    [notifyListeners],
  );

  const changeIsHydrated = useCallback(
    (nextIsHydrated: boolean): void => {
      isHydratedRef.current = nextIsHydrated;
      setIsHydrated(nextIsHydrated);
      notifyListeners();
    },
    [notifyListeners],
  );

  const replaceMutationStatuses = useCallback(
    (statuses: Map<number, WishlistMutationStatus>): void => {
      mutationStatusByProductIdRef.current = statuses;
      setMutationStatusByProductId(statuses);
      notifyListeners();
    },
    [notifyListeners],
  );

  const changeLikedProduct = useCallback(
    (productId: number, liked: boolean): void => {
      const nextIds = updateProductIdSet(
        likedProductIdsRef.current,
        productId,
        liked,
      );
      replaceLikedProductIds(nextIds);
    },
    [replaceLikedProductIds],
  );

  const setMutationStatus = useCallback(
    (productId: number, status: WishlistMutationStatus): void => {
      const currentStatuses = mutationStatusByProductIdRef.current;
      if ((currentStatuses.get(productId) ?? 'idle') === status) return;

      const nextStatuses = new Map(currentStatuses);

      if (status === 'idle') {
        nextStatuses.delete(productId);
      } else {
        nextStatuses.set(productId, status);
      }

      replaceMutationStatuses(nextStatuses);
    },
    [replaceMutationStatuses],
  );

  const persistIntentions = useCallback((): void => {
    const currentStorageKey = storageKeyRef.current;
    if (!currentStorageKey || typeof window === 'undefined') return;

    const intentions = Object.fromEntries(
      desiredByProductIdRef.current.entries(),
    );

    if (Object.keys(intentions).length === 0) {
      window.sessionStorage.removeItem(currentStorageKey);
      return;
    }

    window.sessionStorage.setItem(
      currentStorageKey,
      JSON.stringify(intentions),
    );
  }, []);

  const runMutationQueue = useCallback(
    async (productId: number, generation: number): Promise<void> => {
      while (generation === authGenerationRef.current) {
        const desiredLiked = desiredByProductIdRef.current.get(productId);
        if (desiredLiked === undefined) break;

        const confirmedLiked = confirmedProductIdsRef.current.has(productId);
        if (desiredLiked === confirmedLiked) {
          desiredByProductIdRef.current.delete(productId);
          persistIntentions();
          setMutationStatus(productId, 'idle');
          break;
        }

        try {
          if (desiredLiked) {
            await addWishlistItem(productId);
          } else {
            await removeWishlistItem(productId);
          }
        } catch (error) {
          if (generation !== authGenerationRef.current) return;

          desiredByProductIdRef.current.delete(productId);
          persistIntentions();
          changeLikedProduct(productId, confirmedLiked);
          setMutationStatus(productId, 'error');
          throw error instanceof Error
            ? error
            : new Error('찜 상태를 변경하지 못했습니다.');
        }

        if (generation !== authGenerationRef.current) return;

        confirmedProductIdsRef.current = updateProductIdSet(
          confirmedProductIdsRef.current,
          productId,
          desiredLiked,
        );
        // 찜 목록 캐시를 오래됨으로 표시만 한다(요청은 보내지 않음).
        // 다음에 찜 목록을 볼 때 캐시를 먼저 보여주고 뒤에서 한 번 갱신된다.
        void queryClient.invalidateQueries({
          queryKey: wishlistKeys.lists(),
          refetchType: 'none',
        });

        if (desiredByProductIdRef.current.get(productId) === desiredLiked) {
          desiredByProductIdRef.current.delete(productId);
          persistIntentions();
          setMutationStatus(productId, 'idle');
        }
      }
    },
    [changeLikedProduct, persistIntentions, queryClient, setMutationStatus],
  );

  const ensureMutationQueue = useCallback(
    (productId: number): Promise<void> => {
      const existingRequest = inFlightByProductIdRef.current.get(productId);
      if (existingRequest) return existingRequest;

      const generation = authGenerationRef.current;
      const request = runMutationQueue(productId, generation).finally(() => {
        if (inFlightByProductIdRef.current.get(productId) === request) {
          inFlightByProductIdRef.current.delete(productId);
        }
      });

      inFlightByProductIdRef.current.set(productId, request);
      return request;
    },
    [runMutationQueue],
  );

  const setLiked = useCallback(
    (productId: number, liked: boolean): Promise<void> => {
      if (!Number.isInteger(productId) || productId <= 0) {
        return Promise.reject(new Error('상품 ID는 1 이상의 정수여야 합니다.'));
      }

      const currentDesired = desiredByProductIdRef.current.get(productId);
      if (
        currentDesired === liked ||
        (currentDesired === undefined &&
          likedProductIdsRef.current.has(productId) === liked)
      ) {
        return (
          inFlightByProductIdRef.current.get(productId) ?? Promise.resolve()
        );
      }

      changeLikedProduct(productId, liked);
      desiredByProductIdRef.current.set(productId, liked);
      mutationVersionByProductIdRef.current.set(
        productId,
        (mutationVersionByProductIdRef.current.get(productId) ?? 0) + 1,
      );
      persistIntentions();
      setMutationStatus(productId, 'pending');

      return ensureMutationQueue(productId);
    },
    [
      changeLikedProduct,
      ensureMutationQueue,
      persistIntentions,
      setMutationStatus,
    ],
  );

  const hydrate = useCallback((): Promise<void> => {
    if (hydratePromiseRef.current) return hydratePromiseRef.current;

    const generation = authGenerationRef.current;
    const versionSnapshot = new Map(mutationVersionByProductIdRef.current);
    const request = (async (): Promise<void> => {
      try {
        const serverProductIds = await getWishlistIds();
        if (generation !== authGenerationRef.current) return;

        let confirmedIds = new Set(serverProductIds);

        mutationVersionByProductIdRef.current.forEach((version, productId) => {
          if (versionSnapshot.get(productId) === version) return;

          confirmedIds = updateProductIdSet(
            confirmedIds,
            productId,
            confirmedProductIdsRef.current.has(productId),
          );
        });

        confirmedProductIdsRef.current = confirmedIds;

        const storedIntentions = readStoredIntentions(storageKeyRef.current);
        storedIntentions.forEach((liked, productId) => {
          if (!desiredByProductIdRef.current.has(productId)) {
            desiredByProductIdRef.current.set(productId, liked);
          }
        });

        let visibleIds = new Set(confirmedIds);
        desiredByProductIdRef.current.forEach((liked, productId) => {
          visibleIds = updateProductIdSet(visibleIds, productId, liked);
          setMutationStatus(productId, 'pending');
        });
        replaceLikedProductIds(visibleIds);
        changeIsHydrated(true);

        await Promise.allSettled(
          Array.from(desiredByProductIdRef.current.keys()).map((productId) =>
            ensureMutationQueue(productId),
          ),
        );
      } catch (error) {
        if (generation === authGenerationRef.current) {
          changeIsHydrated(false);
        }

        throw error instanceof Error
          ? error
          : new Error('찜 목록을 불러오지 못했습니다.');
      }
    })().finally(() => {
      if (hydratePromiseRef.current === request) {
        hydratePromiseRef.current = null;
      }
    });

    hydratePromiseRef.current = request;
    return request;
  }, [
    changeIsHydrated,
    ensureMutationQueue,
    replaceLikedProductIds,
    setMutationStatus,
  ]);

  const flushPendingMutations = useCallback(async (): Promise<void> => {
    while (inFlightByProductIdRef.current.size > 0) {
      await Promise.allSettled(inFlightByProductIdRef.current.values());
    }
  }, []);

  const prepareWishlistNavigation = useCallback(async (): Promise<void> => {
    await flushPendingMutations();
  }, [flushPendingMutations]);

  useEffect(() => {
    async function syncWishlistWithAuth(): Promise<void> {
      const previousStorageKey = storageKeyRef.current;

      if (previousStorageKey !== storageKey) {
        authGenerationRef.current += 1;
        hydratePromiseRef.current = null;
        storageKeyRef.current = storageKey;
        desiredByProductIdRef.current.clear();
        inFlightByProductIdRef.current.clear();
        mutationVersionByProductIdRef.current.clear();
        confirmedProductIdsRef.current = new Set();
        replaceLikedProductIds(new Set());
        replaceMutationStatuses(new Map());
        changeIsHydrated(false);

        if (previousStorageKey && typeof window !== 'undefined') {
          window.sessionStorage.removeItem(previousStorageKey);
        }
      }

      if (!isAuthenticated) {
        replaceLikedProductIds(new Set());
        confirmedProductIdsRef.current = new Set();
        changeIsHydrated(false);
        return;
      }

      try {
        await hydrate();
      } catch {
        return;
      }
    }

    void syncWishlistWithAuth();
  }, [
    changeIsHydrated,
    hydrate,
    isAuthenticated,
    replaceLikedProductIds,
    replaceMutationStatuses,
    storageKey,
  ]);

  const isLiked = useCallback(
    (productId: number): boolean => likedProductIds.has(productId),
    [likedProductIds],
  );

  const getMutationStatus = useCallback(
    (productId: number): WishlistMutationStatus =>
      mutationStatusByProductId.get(productId) ?? 'idle',
    [mutationStatusByProductId],
  );

  const contextValue = useMemo<WishlistContextValue>(
    () => ({
      isHydrated,
      isLiked,
      getMutationStatus,
      setLiked,
      hydrate,
      prepareWishlistNavigation,
    }),
    [
      isHydrated,
      isLiked,
      getMutationStatus,
      setLiked,
      hydrate,
      prepareWishlistNavigation,
    ],
  );

  // ref만 읽는 함수라서 이 값은 처음 만든 뒤로 바뀌지 않는다.
  const store = useMemo<WishlistStore>(
    () => ({
      subscribe,
      getIsHydrated: () => isHydratedRef.current,
      getIsLiked: (productId) => likedProductIdsRef.current.has(productId),
      getMutationStatus: (productId) =>
        mutationStatusByProductIdRef.current.get(productId) ?? 'idle',
      setLiked,
      hydrate,
    }),
    [subscribe, setLiked, hydrate],
  );

  return (
    <WishlistStoreContext.Provider value={store}>
      <WishlistContext.Provider value={contextValue}>
        {children}
      </WishlistContext.Provider>
    </WishlistStoreContext.Provider>
  );
}

export function useWishlist(): WishlistContextValue {
  const context = useContext(WishlistContext);

  if (!context) {
    throw new Error('useWishlist는 WishlistProvider 안에서 사용해야 합니다.');
  }

  return context;
}

// 클릭 처리처럼 "그 순간의 값"만 필요할 때 쓴다. 찜이 바뀌어도 다시 렌더링되지 않는다.
export function useWishlistActions(): WishlistStore {
  const store = useContext(WishlistStoreContext);

  if (!store) {
    throw new Error(
      'useWishlistActions는 WishlistProvider 안에서 사용해야 합니다.',
    );
  }

  return store;
}

// 상품 하나의 찜 상태만 구독한다. 다른 상품의 찜이 바뀌면 다시 렌더링되지 않는다.
export function useWishlistItem(productId: number): WishlistItemState {
  const store = useWishlistActions();
  const getIsLiked = (): boolean => store.getIsLiked(productId);
  const getMutationStatus = (): WishlistMutationStatus =>
    store.getMutationStatus(productId);

  return {
    isHydrated: useSyncExternalStore<boolean>(
      store.subscribe,
      store.getIsHydrated,
      store.getIsHydrated,
    ),
    isLiked: useSyncExternalStore<boolean>(
      store.subscribe,
      getIsLiked,
      getIsLiked,
    ),
    mutationStatus: useSyncExternalStore<WishlistMutationStatus>(
      store.subscribe,
      getMutationStatus,
      getMutationStatus,
    ),
  };
}

// 주어진 상품 중 찜 변경에 실패한 것이 있는지만 구독한다(true/false가 바뀔 때만 렌더링).
export function useHasWishlistMutationError(productIds: number[]): boolean {
  const store = useWishlistActions();
  const getHasError = (): boolean =>
    productIds.some(
      (productId) => store.getMutationStatus(productId) === 'error',
    );

  return useSyncExternalStore<boolean>(
    store.subscribe,
    getHasError,
    getHasError,
  );
}

export type { WishlistMutationStatus };
