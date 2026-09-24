import { Suspense } from 'react';

import ProductListView from './ProductListView';

// useSearchParams를 쓰는 화면은 Suspense로 감싸야 빌드된다.
export default function ProductsPage() {
  return (
    <Suspense>
      <ProductListView />
    </Suspense>
  );
}
