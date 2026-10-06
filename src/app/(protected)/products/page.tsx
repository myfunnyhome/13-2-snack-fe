import { Suspense } from 'react';

import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from '@tanstack/react-query';

import ProductListView from './ProductListView';
import { fetchProductsOnServer } from './fetchProductsOnServer';
import {
  PRODUCT_LIST_PAGE_SIZE,
  productListQueryKey,
  resolveProductListQuery,
} from './productListQuery';

type ProductsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

// 첫 페이지를 서버에서 받아 HTML에 담는다. (자세한 이유는 fetchProductsOnServer.ts)
// ProductListView는 같은 쿼리 키로 이 데이터를 이어받아 첫 요청을 다시 하지 않는다.
export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const params = await searchParams;
  const { filter, sort } = resolveProductListQuery(
    firstValue(params.categoryId),
    firstValue(params.sort),
  );

  const queryClient = new QueryClient();
  const firstPage = await fetchProductsOnServer({
    ...filter,
    sort,
    page: 1,
    limit: PRODUCT_LIST_PAGE_SIZE,
  });

  // 실패하면 비워 둔다. 화면이 기존처럼 브라우저에서 받는다.
  if (firstPage) {
    queryClient.setQueryData(productListQueryKey(filter, sort), {
      pages: [firstPage],
      pageParams: [1],
    });
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {/* useSearchParams를 쓰는 화면은 Suspense로 감싸야 빌드된다. */}
      <Suspense>
        <ProductListView />
      </Suspense>
    </HydrationBoundary>
  );
}
