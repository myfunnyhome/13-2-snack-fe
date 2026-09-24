import { fetchClient } from './fetchClient';

/*
@ 상품 API 호출부
- 경로에 /api를 붙이지 않는다. fetchClient가 붙이고 쿠키·토큰 갱신까지 처리한다.
- 응답의 data만 돌아오므로 아래 타입은 data 기준이다.
*/

export const PRODUCT_SORTS = [
  'latest',
  'popular',
  'priceAsc',
  'priceDesc',
] as const;

export type ProductSort = (typeof PRODUCT_SORTS)[number];

export function isProductSort(value: string | null): value is ProductSort {
  return PRODUCT_SORTS.some((sort) => sort === value);
}

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

export type ProductDetail = ProductListItem & {
  productUrl: string | null;
  updatedAt: string;
  createdBy: { id: number; name: string };
  /** 로그인한 사용자가 이 상품의 등록자인지. 수정·삭제 노출 판단에 쓴다. */
  isMine: boolean;
};

export type ProductListResponse = {
  products: ProductListItem[];
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNext: boolean;
};

export type ProductListParams = {
  keyword?: string;
  /** 소분류 하나만 조회 */
  categoryId?: number;
  /** 대분류 아래 소분류 전체 조회 */
  parentCategoryId?: number;
  sort?: ProductSort;
  page?: number;
  limit?: number;
};

export type ProductFormInput = {
  name: string;
  price: number;
  categoryId: number;
  imageUrl?: string | null;
  productUrl?: string | null;
};

export type UploadedImage = {
  imageKey: string;
  imageUrl: string;
};

const PRODUCTS_PATH = '/products';
const MY_PRODUCTS_PATH = '/me/products';
const IMAGES_PATH = '/images';

// 값이 없는 조건은 쿼리에서 빼야 서버 기본값(page 1, sort latest)이 적용된다.
function toQueryString(params: ProductListParams): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }

    searchParams.set(key, String(value));
  });

  const query = searchParams.toString();
  return query === '' ? '' : `?${query}`;
}

export async function getProducts(
  params: ProductListParams = {},
): Promise<ProductListResponse> {
  return fetchClient<ProductListResponse>(
    `${PRODUCTS_PATH}${toQueryString(params)}`,
  );
}

// 내가 등록한 상품만. 목록 조건은 getProducts와 같다.
export async function getMyProducts(
  params: ProductListParams = {},
): Promise<ProductListResponse> {
  return fetchClient<ProductListResponse>(
    `${MY_PRODUCTS_PATH}${toQueryString(params)}`,
  );
}

export async function getProduct(productId: number): Promise<ProductDetail> {
  return fetchClient<ProductDetail>(`${PRODUCTS_PATH}/${productId}`);
}

export async function createProduct(
  input: ProductFormInput,
): Promise<ProductDetail> {
  return fetchClient<ProductDetail>(PRODUCTS_PATH, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updateProduct(
  productId: number,
  input: Partial<ProductFormInput>,
): Promise<ProductDetail> {
  return fetchClient<ProductDetail>(`${PRODUCTS_PATH}/${productId}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export async function deleteProduct(productId: number): Promise<void> {
  await fetchClient<unknown>(`${PRODUCTS_PATH}/${productId}`, {
    method: 'DELETE',
  });
}

// 이미지는 FormData로 보낸다. Content-Type은 브라우저가 경계 문자열까지 붙여야 해서 지정하지 않는다.
export async function uploadProductImage(file: File): Promise<UploadedImage> {
  const formData = new FormData();
  formData.append('image', file);

  return fetchClient<UploadedImage>(IMAGES_PATH, {
    method: 'POST',
    body: formData,
  });
}
