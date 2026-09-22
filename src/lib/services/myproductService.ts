import { fetchClient } from '@/lib/services/fetchClient';

export type ProductSort = 'latest' | 'popular' | 'priceAsc' | 'priceDesc';

export type ProductCategory = {
  id: number;
  name: string;
  parentId: number | null;
};

export type ProductListItem = {
  id: number;
  name: string;
  price: number;
  imageUrl: string | null;
  purchaseCount: number;
  createdAt: string;
  category: ProductCategory;
};

export type MyProductsParams = {
  sort: ProductSort;
  page: number;
  limit: number;
};

export type ProductListResponse = {
  products: ProductListItem[];
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNext: boolean;
};

export async function getMyProducts(
  params: MyProductsParams,
  signal?: AbortSignal,
): Promise<ProductListResponse> {
  const searchParams = new URLSearchParams({
    sort: params.sort,
    page: String(params.page),
    limit: String(params.limit),
  });

  return fetchClient<ProductListResponse>(
    `/me/products?${searchParams.toString()}`,
    { signal },
  );
}
