'use client';

import { useState } from 'react';

import { useQuery } from '@tanstack/react-query';

import DropdownButton from '@/components/ui/Dropdown/DropdownButton';
import DropdownItem from '@/components/ui/Dropdown/DropdownItem';
import Pagination from '@/components/ui/List/Pagination';
import ProductList, {
  PRODUCT_LIST_DESKTOP_COLUMNS,
} from '@/components/ui/List/ProductList';
import { ApiError } from '@/lib/services/fetchClient';
import {
  type MyProductSort,
  type ProductListResponse,
  getMyProducts,
} from '@/lib/services/myProductService';
import { cn } from '@/utils/cn';

const SORT_OPTIONS: Array<{ value: MyProductSort; label: string }> = [
  { value: 'latest', label: '최신순' },
  { value: 'priceAsc', label: '낮은 가격순' },
  { value: 'priceDesc', label: '높은 가격순' },
];

const PAGE_SIZE = 4;
const MY_PRODUCTS_QUERY_KEY = 'my-products';

export default function MyProductsScreen() {
  const [sort, setSort] = useState<MyProductSort>('latest');
  const [currentPage, setCurrentPage] = useState<number>(1);

  const myProductsQuery = useQuery<ProductListResponse, Error>({
    queryKey: [MY_PRODUCTS_QUERY_KEY, sort, currentPage, PAGE_SIZE],
    queryFn: async ({ signal }) => {
      try {
        return await getMyProducts(
          {
            sort,
            page: currentPage,
            limit: PAGE_SIZE,
          },
          signal,
        );
      } catch (caughtError: unknown) {
        if (
          caughtError instanceof ApiError &&
          caughtError.status === 400 &&
          currentPage > 1
        ) {
          return getMyProducts(
            {
              sort,
              page: 1,
              limit: PAGE_SIZE,
            },
            signal,
          );
        }

        throw caughtError;
      }
    },
    retry: (failureCount, queryError) => {
      if (queryError instanceof ApiError && queryError.status === 400) {
        return false;
      }

      return failureCount < 3;
    },
  });

  const products = myProductsQuery.data?.products ?? [];
  const totalCount = myProductsQuery.data?.totalCount ?? 0;
  const totalPages = myProductsQuery.data?.totalPages ?? 0;
  const requestPage =
    totalPages > 0 ? Math.min(currentPage, totalPages) : currentPage;
  const isLoading = myProductsQuery.isPending;
  const hasError = myProductsQuery.isError;
  const error = myProductsQuery.error;

  function handleSortChange(value: string): void {
    const nextSort = SORT_OPTIONS.find(
      (option) => option.value === value,
    )?.value;

    if (!nextSort) {
      return;
    }

    setSort(nextSort);
    setCurrentPage(1);
  }

  return (
    <div className="flex flex-col gap-6 px-6 pt-6 pb-16 md:gap-8 md:px-8 md:pt-10 lg:px-[110px]">
      <div className="flex flex-col gap-4 pb-4 md:gap-6 md:pb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-20-bold text-primary-950 md:text-24-bold">
            상품 등록 내역
          </h1>
          <DropdownButton
            value={sort}
            onChange={handleSortChange}
            placeholder="정렬"
            containerClassName="w-[120px]"
            className="gap-1 border-primary-300 px-4 py-2.5 text-14-regular"
            listClassName="border-primary-300"
          >
            {SORT_OPTIONS.map(({ value, label }) => (
              <DropdownItem
                key={value}
                value={value}
                className="text-16-regular"
              >
                {label}
              </DropdownItem>
            ))}
          </DropdownButton>
        </div>
      </div>

      <div
        aria-busy={myProductsQuery.isFetching}
        className="flex flex-col gap-5"
      >
        {isLoading ? (
          <p role="status" className="text-14-regular text-primary-500">
            상품을 불러오는 중입니다.
          </p>
        ) : null}

        {!isLoading && hasError ? (
          <div role="alert" className="flex flex-col items-start gap-3">
            <p className="text-14-regular text-primary-500">
              {error instanceof Error
                ? error.message
                : '상품을 불러오지 못했습니다.'}
            </p>
            <button
              type="button"
              onClick={() => {
                void myProductsQuery.refetch();
              }}
              className="text-14-regular text-primary-950 underline"
            >
              다시 시도
            </button>
          </div>
        ) : null}

        {!isLoading && !hasError && products.length === 0 ? (
          <p className="text-14-regular text-primary-500">
            등록한 상품이 없습니다.
          </p>
        ) : null}

        {!isLoading && !hasError && products.length > 0 ? (
          <>
            <p className="text-14-regular text-primary-500 lg:hidden">
              총 등록한 상품 {totalCount}개
            </p>

            <div
              className={cn(
                PRODUCT_LIST_DESKTOP_COLUMNS,
                'hidden h-16 border-t border-b border-primary-100 lg:grid',
              )}
            >
              <div className="flex min-w-0 items-center gap-5">
                <div className="size-10 shrink-0" aria-hidden />
                <p className="text-16-bold text-primary-500">상품명</p>
              </div>
              <p className="text-16-bold text-primary-500">등록일</p>
              <p className="text-16-bold text-primary-500">카테고리</p>
              <p className="text-16-bold text-primary-500">가격</p>
              <p className="text-16-bold text-primary-500">제품 링크</p>
            </div>

            {products.map((product) => (
              <div key={product.id}>
                <ProductList
                  size="md"
                  imageUrl={product.imageUrl}
                  name={product.name}
                  createdAt={product.createdAt}
                  category={product.category.name}
                  price={product.price}
                  productUrl={product.productUrl}
                  className="lg:hidden"
                />
                <ProductList
                  size="lg"
                  imageUrl={product.imageUrl}
                  name={product.name}
                  createdAt={product.createdAt}
                  category={product.category.name}
                  price={product.price}
                  productUrl={product.productUrl}
                  className="hidden lg:grid"
                />
              </div>
            ))}
          </>
        ) : null}
      </div>

      {totalPages > 0 && !hasError ? (
        <>
          <div className="md:hidden">
            <Pagination
              size="sm"
              currentPage={requestPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
          <div className="hidden md:block">
            <Pagination
              size="lg"
              currentPage={requestPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </>
      ) : null}
    </div>
  );
}
