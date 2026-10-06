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

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { wishlistQueryKeys } from '@/hooks/wishlist/wishlistQueryKeys';
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

type WishlistChangeInput = {
  productId: number;
  liked: boolean;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);
const STORAGE_KEY_PREFIX = 'snack:wishlist-intent:';

function toStorageKey(email: string | null): string | null {
  return email ? `${STORAGE_KEY_PREFIX}${encodeURIComponent(email)}` : null;
}

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
  if (!storageKey) return new Map();

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

/*
@ 찜 상태
- 서버가 확정한 찜 ID 목록은 React Query 캐시(wishlistQueryKeys.ids)가 들고 있다.
- 사용자가 눌렀지만 아직 서버에 반영되지 않은 값은 desired에 두고,
  화면에는 "서버 값 위에 desired를 덮은 값"을 보여준다(낙관적 반영).
- 요청이 실패하면 desired만 지우면 되므로 따로 되돌릴 필요가 없다.
*/
export default function WishlistProvider({ children }: PropsWithChildren) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  // 로그아웃하면 email이 null이 되어 쿼리 키가 바뀌므로 인증 여부를 따로 보지 않는다.
  const email = user?.email ?? null;

  const wishlistIdsQuery = useQuery({
    queryKey: wishlistQueryKeys.ids(email),
    queryFn: getWishlistIds,
    enabled: email !== null,
  });

  const { mutateAsync: changeWishlist } = useMutation({
    mutationKey: wishlistQueryKeys.change(),
    mutationFn: ({ productId, liked }: WishlistChangeInput) =>
      liked ? addWishlistItem(productId) : removeWishlistItem(productId),
  });

  const [desiredByProductId, setDesiredByProductId] = useState<
    Map<number, boolean>
  >(() => new Map());
  const [mutationStatusByProductId, setMutationStatusByProductId] = useState<
    Map<number, WishlistMutationStatus>
  >(() => new Map());

  const desiredByProductIdRef = useRef<Map<number, boolean>>(new Map());
  const inFlightByProductIdRef = useRef<Map<number, Promise<void>>>(new Map());
  const authGenerationRef = useRef(0);
  const emailRef = useRef<string | null>(email);

  const isHydrated = wishlistIdsQuery.data !== undefined;

  const isConfirmedLiked = useCallback(
    (productId: number): boolean =>
      queryClient
        .getQueryData<number[]>(wishlistQueryKeys.ids(emailRef.current))
        ?.includes(productId) ?? false,
    [queryClient],
  );

  const persistIntentions = useCallback((): void => {
    const currentStorageKey = toStorageKey(emailRef.current);
    if (!currentStorageKey) return;

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

  const replaceDesired = useCallback(
    (nextDesired: Map<number, boolean>): void => {
      desiredByProductIdRef.current = nextDesired;
      setDesiredByProductId(nextDesired);
      persistIntentions();
    },
    [persistIntentions],
  );

  const setDesired = useCallback(
    (productId: number, liked: boolean | undefined): void => {
      const nextDesired = new Map(desiredByProductIdRef.current);

      if (liked === undefined) {
        nextDesired.delete(productId);
      } else {
        nextDesired.set(productId, liked);
      }

      replaceDesired(nextDesired);
    },
    [replaceDesired],
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

  const runMutationQueue = useCallback(
    async (productId: number, generation: number): Promise<void> => {
      const idsQueryKey = wishlistQueryKeys.ids(emailRef.current);

      while (generation === authGenerationRef.current) {
        const desiredLiked = desiredByProductIdRef.current.get(productId);
        if (desiredLiked === undefined) break;

        if (desiredLiked === isConfirmedLiked(productId)) {
          setDesired(productId, undefined);
          setMutationStatus(productId, 'idle');
          break;
        }

        try {
          // 진행 중인 재조회가 요청 전 값으로 캐시를 덮어쓰지 않게 멈춘다.
          // 첫 조회(데이터 없음)는 멈추면 되돌릴 값이 없어 그대로 둔다.
          if (queryClient.getQueryData(idsQueryKey) !== undefined) {
            await queryClient.cancelQueries({ queryKey: idsQueryKey });
          }

          await changeWishlist({ productId, liked: desiredLiked });
        } catch (error) {
          if (generation !== authGenerationRef.current) return;

          setDesired(productId, undefined);
          setMutationStatus(productId, 'error');
          throw error;
        }

        if (generation !== authGenerationRef.current) return;

        // 아직 조회 전이면 캐시를 만들지 않는다(부분 데이터로 hydrate된 것처럼 보이지 않게).
        queryClient.setQueryData<number[]>(idsQueryKey, (currentIds) =>
          currentIds === undefined
            ? undefined
            : Array.from(
                updateProductIdSet(
                  new Set(currentIds),
                  productId,
                  desiredLiked,
                ),
              ),
        );

        if (desiredByProductIdRef.current.get(productId) === desiredLiked) {
          setDesired(productId, undefined);
          setMutationStatus(productId, 'idle');
        }
      }
    },
    [
      changeWishlist,
      isConfirmedLiked,
      queryClient,
      setDesired,
      setMutationStatus,
    ],
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

        // 모든 요청이 끝나면 서버 값으로 한 번 맞춘다.
        if (
          generation === authGenerationRef.current &&
          inFlightByProductIdRef.current.size === 0
        ) {
          void queryClient.invalidateQueries({
            queryKey: wishlistQueryKeys.ids(emailRef.current),
          });
        }
      });

      inFlightByProductIdRef.current.set(productId, request);
      return request;
    },
    [queryClient, runMutationQueue],
  );

  const setLiked = useCallback(
    (productId: number, liked: boolean): Promise<void> => {
      if (!Number.isInteger(productId) || productId <= 0) {
        return Promise.reject(new Error('상품 ID는 1 이상의 정수여야 합니다.'));
      }

      const currentLiked =
        desiredByProductIdRef.current.get(productId) ??
        isConfirmedLiked(productId);

      if (currentLiked === liked) {
        return (
          inFlightByProductIdRef.current.get(productId) ?? Promise.resolve()
        );
      }

      setDesired(productId, liked);
      setMutationStatus(productId, 'pending');

      return ensureMutationQueue(productId);
    },
    [ensureMutationQueue, isConfirmedLiked, setDesired, setMutationStatus],
  );

  // 새로고침 전에 남겨둔 찜 의도를 되살려 서버에 반영한다.
  const syncPendingIntentions = useCallback((): Promise<unknown> => {
    const storedIntentions = readStoredIntentions(
      toStorageKey(emailRef.current),
    );
    const nextDesired = new Map(desiredByProductIdRef.current);

    storedIntentions.forEach((liked, productId) => {
      if (!nextDesired.has(productId)) {
        nextDesired.set(productId, liked);
      }
    });

    replaceDesired(nextDesired);
    nextDesired.forEach((_liked, productId) => {
      setMutationStatus(productId, 'pending');
    });

    return Promise.allSettled(
      Array.from(nextDesired.keys()).map((productId) =>
        ensureMutationQueue(productId),
      ),
    );
  }, [ensureMutationQueue, replaceDesired, setMutationStatus]);

  const hydrate = useCallback(async (): Promise<void> => {
    if (!emailRef.current) {
      throw new Error('찜 목록을 불러오지 못했습니다.');
    }

    // 캐시에 값이 있으면 그대로 쓰고, 없을 때만 조회한다.
    await queryClient.query({
      queryKey: wishlistQueryKeys.ids(emailRef.current),
      queryFn: getWishlistIds,
      staleTime: 'static',
    });

    await syncPendingIntentions();
  }, [queryClient, syncPendingIntentions]);

  // 화면을 떠나기 전에 남은 찜 요청이 모두 끝나길 기다린다.
  const prepareWishlistNavigation = useCallback(async (): Promise<void> => {
    while (inFlightByProductIdRef.current.size > 0) {
      await Promise.allSettled(inFlightByProductIdRef.current.values());
    }
  }, []);

  // 계정이 바뀌면 이전 계정의 진행 상태를 버린다.
  // 이전 계정의 캐시는 AuthProvider가 로그아웃할 때 지운다.
  useEffect(() => {
    const previousEmail = emailRef.current;
    if (previousEmail === email) return;

    authGenerationRef.current += 1;
    emailRef.current = email;
    inFlightByProductIdRef.current.clear();
    desiredByProductIdRef.current = new Map();
    setDesiredByProductId(new Map());
    setMutationStatusByProductId(new Map());

    const previousStorageKey = toStorageKey(previousEmail);
    if (previousStorageKey) {
      window.sessionStorage.removeItem(previousStorageKey);
    }
  }, [email]);

  useEffect(() => {
    if (!isHydrated) return;

    void syncPendingIntentions();
  }, [isHydrated, syncPendingIntentions]);

  const likedProductIds = useMemo(() => {
    let visibleIds = new Set(wishlistIdsQuery.data);

    desiredByProductId.forEach((liked, productId) => {
      visibleIds = updateProductIdSet(visibleIds, productId, liked);
    });

    return visibleIds;
  }, [desiredByProductId, wishlistIdsQuery.data]);

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

  return (
    <WishlistContext.Provider value={contextValue}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist(): WishlistContextValue {
  const context = useContext(WishlistContext);

  if (!context) {
    throw new Error('useWishlist는 WishlistProvider 안에서 사용해야 합니다.');
  }

  return context;
}

export type { WishlistMutationStatus };
