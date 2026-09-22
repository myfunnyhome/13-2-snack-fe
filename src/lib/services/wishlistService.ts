import { fetchClient } from '@/lib/services/fetchClient';

// 백엔드 GET /me/wishlist 응답의 product 필드 그대로 (imageUrl은 nullable).
export type WishlistItem = {
  id: number;
  name: string;
  price: number;
  imageUrl: string | null;
  purchaseCount: number;
};

export type WishlistPage = {
  items: WishlistItem[];
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNext: boolean;
};

export type GetWishlistParams = {
  page?: number;
  limit?: number;
};

const WISHLIST_PATH = '/me/wishlist';

// GET /me/wishlist/ids — 상품 상세 없이 productId 배열만 내려주는 경량 조회.
// 로그인/앱 진입 시점에 WishlistProvider.hydrate()를 호출하기 위한 용도(무거운
// getWishlist를 이 목적으로 쓰지 않는다 — 페이지네이션 응답을 다 끌어와야 함).
export async function getWishlistIds(): Promise<number[]> {
  const { productIds } = await fetchClient<{ productIds: number[] }>(
    `${WISHLIST_PATH}/ids`,
  );

  return productIds;
}

export async function getWishlist({
  page = 1,
  limit = 6,
}: GetWishlistParams = {}): Promise<WishlistPage> {
  return fetchClient<WishlistPage>(
    `${WISHLIST_PATH}?page=${page}&limit=${limit}`,
  );
}

// POST /me/wishlist/:productId — idempotent (이미 찜한 상품도 200)
export async function addWishlistItem(
  productId: number,
): Promise<{ productId: number }> {
  return fetchClient<{ productId: number }>(`${WISHLIST_PATH}/${productId}`, {
    method: 'POST',
    keepalive: true,
  });
}

// DELETE /me/wishlist/:productId — idempotent (안 찜한 상품도 200)
// keepalive: true — 찜목록 페이지는 확정 즉시 이 요청을 보내고 바로 다른 화면으로
// 이동할 수 있는 흐름이라(wishlist/page.tsx), 브라우저가 문서를 언로드해도 이 요청만은
// 끝까지 전송을 보장해준다. 일반 fetch는 언로드 시 취소될 수 있음(Playwright로 재현 확인).
export async function removeWishlistItem(
  productId: number,
): Promise<{ productId: number; deletedCount: number }> {
  return fetchClient<{ productId: number; deletedCount: number }>(
    `${WISHLIST_PATH}/${productId}`,
    {
      method: 'DELETE',
      keepalive: true,
    },
  );
}

// DELETE /me/wishlist { productIds } — 배치 해제, productIds는 1개 이상이어야 함(400 방지는 호출부 책임)
export async function removeWishlistItems(
  productIds: number[],
): Promise<{ deletedCount: number }> {
  return fetchClient<{ deletedCount: number }>(WISHLIST_PATH, {
    method: 'DELETE',
    body: JSON.stringify({ productIds }),
  });
}
