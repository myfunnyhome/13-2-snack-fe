'use client';

import { useState } from 'react';

import DropdownButton from '@/components/ui/Dropdown/DropdownButton';
import DropdownItem from '@/components/ui/Dropdown/DropdownItem';
import Pagination from '@/components/ui/List/Pagination';
import ProductList from '@/components/ui/List/ProductList';
import { useMyProducts } from '@/hooks/my-products/useMyProducts';
import type { ProductSort } from '@/lib/services/myproductService';

type MyProductSort = Exclude<ProductSort, 'popular'>;

const SORT_OPTIONS: Array<{ value: MyProductSort; label: string }> = [
  { value: 'latest', label: '최신순' },
  { value: 'priceAsc', label: '낮은 가격순' },
  { value: 'priceDesc', label: '높은 가격순' },
];

const PAGE_SIZE = 4;

export default function MyProductsPage() {
  const [sort, setSort] = useState<MyProductSort>('latest');
  const [currentPage, setCurrentPage] = useState(1);

  const { data, error, isLoading, isFetching, refetch } = useMyProducts({
    sort,
    page: currentPage,
    limit: PAGE_SIZE,
  });

  const products = data?.products ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = data?.totalPages ?? 0;

  function handleSortChange(value: string): void {
    const nextSort = SORT_OPTIONS.find(
      (option) => option.value === value,
    )?.value;

    if (!nextSort) return;

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

      <div aria-busy={isFetching} className="flex flex-col gap-5">
        {isLoading ? (
          <p role="status" className="text-14-regular text-primary-500">
            상품을 불러오는 중입니다.
          </p>
        ) : null}

        {!isLoading && error ? (
          <div role="alert" className="flex flex-col items-start gap-3">
            <p className="text-14-regular text-primary-500">{error.message}</p>
            <button
              type="button"
              onClick={refetch}
              className="text-14-regular text-primary-950 underline"
            >
              다시 시도
            </button>
          </div>
        ) : null}

        {!isLoading && !error && products.length === 0 ? (
          <p className="text-14-regular text-primary-500">
            등록한 상품이 없습니다.
          </p>
        ) : null}

        {!isLoading && !error && products.length > 0 ? (
          <>
            <p className="text-14-regular text-primary-500 lg:hidden">
              총 등록한 상품 {totalCount}개
            </p>

            <div className="flex flex-col lg:hidden">
              {products.map((product) => (
                <ProductList
                  key={product.id}
                  size="md"
                  imageUrl={product.imageUrl}
                  name={product.name}
                  createdAt={product.createdAt}
                  category={product.category.name}
                  price={product.price}
                  productUrl={null}
                />
              ))}
            </div>

            <div className="hidden lg:block">
              <div className="flex h-16 w-full items-center gap-20 border-t border-b border-primary-100 ">
                <p className="w-65 text-center text-16-bold text-primary-500">
                  상품명
                </p>
                <p className="w-45 text-center text-16-bold text-primary-500">
                  등록일
                </p>
                <p className="w-45 text-center text-16-bold text-primary-500">
                  카테고리
                </p>
                <p className="w-40 text-center text-16-bold text-primary-500">
                  가격
                </p>
                <p className="w-45 text-center text-16-bold text-primary-500">
                  제품 링크
                </p>
              </div>
              {products.map((product) => (
                <ProductList
                  key={product.id}
                  size="lg"
                  imageUrl={product.imageUrl}
                  name={product.name}
                  createdAt={product.createdAt}
                  category={product.category.name}
                  price={product.price}
                  productUrl={null}
                />
              ))}
            </div>
          </>
        ) : null}
      </div>

      {totalPages > 0 ? (
        <>
          <div className="md:hidden">
            <Pagination
              size="sm"
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
          <div className="hidden md:block">
            <Pagination
              size="lg"
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </>
      ) : null}
    </div>
  );
}
