import { fetchClient } from './fetchClient';

export type CartProduct = {
  id: number;
  name: string;
  price: number;
  imageUrl: string | null;
  isDeleted: boolean;
};

export type CartItem = {
  id: number;
  quantity: number;
  productId: number;
  product: CartProduct;
};

/*
@ 장바구니 API 호출부
- 상품 상세의 "장바구니 담기"에 필요한 것만 우선 만들었다.
- 장바구니 화면 담당자가 조회·수정·삭제를 추가할 때 이 파일을 같이 쓰면 된다.
*/

export type AddCartItemInput = {
  productId: number;
  quantity: number;
};

const CART_ITEMS_PATH = '/me/cart-items';

export async function getCartItems(): Promise<CartItem[]> {
  return fetchClient<CartItem[]>(CART_ITEMS_PATH);
}

export async function updateCartItemQuantity(
  cartItemId: number,
  quantity: number,
): Promise<CartItem> {
  return fetchClient<CartItem>(`${CART_ITEMS_PATH}/${cartItemId}`, {
    method: 'PATCH',
    body: JSON.stringify({ quantity }),
  });
}

export async function removeCartItem(cartItemId: number): Promise<CartItem> {
  return fetchClient<CartItem>(`${CART_ITEMS_PATH}/${cartItemId}`, {
    method: 'DELETE',
  });
}

export async function addCartItem(input: AddCartItemInput): Promise<unknown> {
  return fetchClient<unknown>(CART_ITEMS_PATH, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}
