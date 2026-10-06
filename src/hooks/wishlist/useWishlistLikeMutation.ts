'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useWishlist } from '@/providers/WishlistProvider';

import { wishlistQueryKeys } from './wishlistQueryKeys';

type WishlistLikeInput = {
  productId: number;
  liked: boolean;
};

// 찜 상태를 바꾸고, 끝나면 찜 상품 목록을 다시 받는다.
// 찜 해제는 서버에 찜 ID가 있어야 요청이 나가므로 hydrate를 먼저 기다린다.
export function useWishlistLikeMutation() {
  const queryClient = useQueryClient();
  const { isHydrated, hydrate, setLiked } = useWishlist();

  return useMutation<void, Error, WishlistLikeInput>({
    mutationFn: async ({ productId, liked }) => {
      if (!isHydrated) {
        await hydrate();
      }

      await setLiked(productId, liked);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: wishlistQueryKeys.allProducts(),
      }),
  });
}
