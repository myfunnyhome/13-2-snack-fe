export const WISHLIST_QUERY_KEY = ['wishlist'] as const;

export const wishlistQueryKeys = {
  ids: (email: string | null) => [...WISHLIST_QUERY_KEY, 'ids', email] as const,
  allProducts: () => [...WISHLIST_QUERY_KEY, 'products'] as const,
  products: (limit: number) =>
    [...wishlistQueryKeys.allProducts(), limit] as const,
  change: () => [...WISHLIST_QUERY_KEY, 'change'] as const,
};
