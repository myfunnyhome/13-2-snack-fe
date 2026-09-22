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
} from 'react';

import {
  addWishlistItem,
  getWishlistIds,
  removeWishlistItem,
} from '@/lib/services/wishlistService';
import { useAuth } from '@/providers/AuthProvider';

type WishlistMutationStatus = 'idle' | 'pending' | 'error';
type WishlistViewPhase = 'inactive' | 'browsing' | 'leaving';

type WishlistContextValue = {
  likedProductIds: ReadonlySet<number>;
  isHydrated: boolean;
  wishlistViewPhase: WishlistViewPhase;
  isLiked: (productId: number) => boolean;
  getMutationStatus: (productId: number) => WishlistMutationStatus;
  setLiked: (productId: number, liked: boolean) => Promise<void>;
  toggleLike: (productId: number) => Promise<void>;
  hydrate: (productIds?: number[]) => Promise<void>;
  flushPendingMutations: () => Promise<void>;
  enterWishlistView: () => void;
  prepareWishlistNavigation: () => Promise<void>;
  /** @deprecated 서버 조회값을 주입하는 이전 호출부 호환용 API */
  syncLiked: (productId: number, liked: boolean) => void;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);
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
  const { isAuthenticated, user } = useAuth();
  const storageKey = user?.email
    ? `${STORAGE_KEY_PREFIX}${encodeURIComponent(user.email)}`
    : null;
  const [likedProductIds, setLikedProductIds] = useState<Set<number>>(
    () => new Set(),
  );
  const [isHydrated, setIsHydrated] = useState(false);
  const [wishlistViewPhase, setWishlistViewPhase] =
    useState<WishlistViewPhase>('inactive');
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

  const replaceLikedProductIds = useCallback(
    (productIds: Set<number>): void => {
      likedProductIdsRef.current = productIds;
      setLikedProductIds(productIds);
    },
    [],
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
      setMutationStatusByProductId((currentStatuses) => {
        if ((currentStatuses.get(productId) ?? 'idle') === status) {
          return currentStatuses;
        }

        const nextStatuses = new Map(currentStatuses);

        if (status === 'idle') {
          nextStatuses.delete(productId);
        } else {
          nextStatuses.set(productId, status);
        }

        return nextStatuses;
      });
    },
    [],
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
        } catch {
          if (generation !== authGenerationRef.current) return;

          desiredByProductIdRef.current.delete(productId);
          persistIntentions();
          changeLikedProduct(productId, confirmedLiked);
          setMutationStatus(productId, 'error');
          return;
        }

        if (generation !== authGenerationRef.current) return;

        confirmedProductIdsRef.current = updateProductIdSet(
          confirmedProductIdsRef.current,
          productId,
          desiredLiked,
        );

        if (desiredByProductIdRef.current.get(productId) === desiredLiked) {
          desiredByProductIdRef.current.delete(productId);
          persistIntentions();
          setMutationStatus(productId, 'idle');
        }
      }
    },
    [changeLikedProduct, persistIntentions, setMutationStatus],
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

  const toggleLike = useCallback(
    (productId: number): Promise<void> =>
      setLiked(productId, !likedProductIdsRef.current.has(productId)),
    [setLiked],
  );

  const hydrate = useCallback(
    (productIds?: number[]): Promise<void> => {
      if (productIds) {
        const serverIds = new Set(productIds);
        confirmedProductIdsRef.current = serverIds;
        replaceLikedProductIds(serverIds);
        setIsHydrated(true);
        return Promise.resolve();
      }

      if (hydratePromiseRef.current) return hydratePromiseRef.current;

      const generation = authGenerationRef.current;
      const versionSnapshot = new Map(mutationVersionByProductIdRef.current);
      const request = (async (): Promise<void> => {
        try {
          const serverProductIds = await getWishlistIds();
          if (generation !== authGenerationRef.current) return;

          let confirmedIds = new Set(serverProductIds);

          mutationVersionByProductIdRef.current.forEach(
            (version, productId) => {
              if (versionSnapshot.get(productId) === version) return;

              confirmedIds = updateProductIdSet(
                confirmedIds,
                productId,
                confirmedProductIdsRef.current.has(productId),
              );
            },
          );

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
          setIsHydrated(true);

          await Promise.allSettled(
            Array.from(desiredByProductIdRef.current.keys()).map((productId) =>
              ensureMutationQueue(productId),
            ),
          );
        } finally {
          if (generation === authGenerationRef.current) {
            setIsHydrated(true);
          }
        }
      })().finally(() => {
        if (hydratePromiseRef.current === request) {
          hydratePromiseRef.current = null;
        }
      });

      hydratePromiseRef.current = request;
      return request;
    },
    [ensureMutationQueue, replaceLikedProductIds, setMutationStatus],
  );

  const flushPendingMutations = useCallback(async (): Promise<void> => {
    while (inFlightByProductIdRef.current.size > 0) {
      await Promise.allSettled(inFlightByProductIdRef.current.values());
    }
  }, []);

  const enterWishlistView = useCallback((): void => {
    setWishlistViewPhase('browsing');
  }, []);

  const prepareWishlistNavigation = useCallback(async (): Promise<void> => {
    setWishlistViewPhase('leaving');
    await flushPendingMutations();
  }, [flushPendingMutations]);

  const syncLiked = useCallback(
    (productId: number, liked: boolean): void => {
      confirmedProductIdsRef.current = updateProductIdSet(
        confirmedProductIdsRef.current,
        productId,
        liked,
      );
      changeLikedProduct(productId, liked);
    },
    [changeLikedProduct],
  );

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
        setMutationStatusByProductId(new Map());
        setIsHydrated(false);
        setWishlistViewPhase('inactive');

        if (previousStorageKey && typeof window !== 'undefined') {
          window.sessionStorage.removeItem(previousStorageKey);
        }
      }

      if (!isAuthenticated) {
        replaceLikedProductIds(new Set());
        confirmedProductIdsRef.current = new Set();
        setIsHydrated(false);
        return;
      }

      await hydrate();
    }

    void syncWishlistWithAuth();
  }, [hydrate, isAuthenticated, replaceLikedProductIds, storageKey]);

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
      likedProductIds,
      isHydrated,
      wishlistViewPhase,
      isLiked,
      getMutationStatus,
      setLiked,
      toggleLike,
      hydrate,
      flushPendingMutations,
      enterWishlistView,
      prepareWishlistNavigation,
      syncLiked,
    }),
    [
      likedProductIds,
      isHydrated,
      wishlistViewPhase,
      isLiked,
      getMutationStatus,
      setLiked,
      toggleLike,
      hydrate,
      flushPendingMutations,
      enterWishlistView,
      prepareWishlistNavigation,
      syncLiked,
    ],
  );

  return (
    <WishlistContext.Provider value={contextValue}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist(): WishlistContextValue {
  const context = useContext(WishlistContext);

  if (!context) {
    throw new Error('useWishlist은 WishlistProvider 안에서 사용해야 합니다.');
  }

  return context;
}

export type { WishlistMutationStatus, WishlistViewPhase };
