import { fetchClient } from '@/lib/services/fetchClient';

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
