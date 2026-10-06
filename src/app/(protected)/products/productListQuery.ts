import {
  type ProductListParams,
  type ProductSort,
  isProductSort,
} from '@/lib/services/productService';

import { DEFAULT_CATEGORY_ID, findCategory } from './productCategories';

/*
@ 상품 목록 조회 조건
- 서버(page.tsx)가 첫 페이지를 미리 받을 때와 화면(ProductListView)이 받을 때
  쿼리 키가 한 글자라도 다르면 미리 받은 데이터를 쓰지 못하고 다시 요청한다.
  그래서 URL → 조회 조건 변환을 이 파일 한 곳에서만 한다.
- 서버·브라우저 양쪽에서 불리므로 'use client'나 next/headers를 두지 않는다.
*/

export const PRODUCT_LIST_PAGE_SIZE = 12;

type ProductListFilter = Pick<
  ProductListParams,
  'categoryId' | 'parentCategoryId'
>;

export function resolveProductListQuery(
  categoryIdParam: string | null | undefined,
  sortParam: string | null | undefined,
) {
  const normalizedSort = sortParam ?? null;
  const sort: ProductSort = isProductSort(normalizedSort)
    ? normalizedSort
    : 'latest';
  const selected =
    findCategory(Number(categoryIdParam)) ?? findCategory(DEFAULT_CATEGORY_ID);

  // 소분류를 고르면 그 소분류만, 대분류만 고르면 그 아래 전체를 불러온다.
  const filter: ProductListFilter = selected?.child
    ? { categoryId: selected.child.id }
    : { parentCategoryId: selected?.parent.id };

  return { sort, selected, filter };
}

export function productListQueryKey(
  filter: ProductListFilter,
  sort: ProductSort,
) {
  return ['products', { ...filter, sort }] as const;
}
