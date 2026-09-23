'use client';

import { useEffect, useRef } from 'react';

import { useInfiniteQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import photoIcon from '@/assets/icons/photo.svg';
import ChevronRightIcon from '@/components/icons/ChevronRightIcon';
import PlusMinusIcon from '@/components/icons/PlusMinusIcon';
import DropdownButton from '@/components/ui/Dropdown/DropdownButton';
import DropdownItem from '@/components/ui/Dropdown/DropdownItem';
import SubCategoryMenu from '@/components/ui/List/SubCategoryMenu';
import ProductCard from '@/components/ui/ProductCard/ProductCard';
import {
  type ProductSort,
  getProducts,
  isProductSort,
} from '@/lib/services/productService';
import { useModal } from '@/providers/ModalProvider';

import ProductFormModalContainer from './ProductFormModalContainer';
import SubCategoryTabs from './SubCategoryTabs';
import {
  DEFAULT_CATEGORY_ID,
  PRODUCT_CATEGORIES,
  findCategory,
} from './productCategories';

/*
@ 상품 리스트
- 카테고리·정렬은 URL(?categoryId=&sort=)에 둔다. 새로고침·뒤로 가기에서 상태가 유지된다.
- 목록은 무한 스크롤이다. 화면 아래 감지용 영역이 보이면 다음 페이지를 불러온다.
*/

const SORT_OPTIONS: { value: ProductSort; label: string }[] = [
  { value: 'latest', label: '최신순' },
  { value: 'popular', label: '판매순' },
  { value: 'priceAsc', label: '낮은 가격순' },
  { value: 'priceDesc', label: '높은 가격순' },
];

const PAGE_SIZE = 12;

export default function ProductListView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { openModal } = useModal();
  const sentinelRef = useRef<HTMLDivElement>(null);

  const sortParam = searchParams.get('sort');
  const sort = isProductSort(sortParam) ? sortParam : 'latest';
  const selected =
    findCategory(Number(searchParams.get('categoryId'))) ??
    findCategory(DEFAULT_CATEGORY_ID);

  // 소분류를 고르면 그 소분류만, 대분류만 고르면 그 아래 전체를 불러온다.
  const categoryFilter = selected?.child
    ? { categoryId: selected.child.id }
    : { parentCategoryId: selected?.parent.id };

  const {
    data,
    isPending,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['products', { ...categoryFilter, sort }],
    queryFn: ({ pageParam }) =>
      getProducts({
        ...categoryFilter,
        sort,
        page: pageParam,
        limit: PAGE_SIZE,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? lastPage.page + 1 : undefined,
  });

  const products = data?.pages.flatMap((page) => page.products) ?? [];

  useEffect(() => {
    const sentinel = sentinelRef.current;

    if (!sentinel || !hasNextPage || isFetchingNextPage) {
      return;
    }

    // 스크롤이 바닥에 닿기 전에 미리 불러온다.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          void fetchNextPage();
        }
      },
      { rootMargin: '200px' },
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // 카테고리 이동은 뒤로 가기가 되도록 push, 정렬은 replace.
  function updateQuery(
    key: 'categoryId' | 'sort',
    value: string,
    mode: 'push' | 'replace',
  ): void {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    router[mode](`${pathname}?${params.toString()}`, { scroll: false });
  }

  function handleOpenCreateModal(): void {
    openModal(<ProductFormModalContainer mode="create" />);
  }

  return (
    <div className="pt-5 pb-10 md:px-6 md:pt-0 lg:px-5 lg:pt-20 lg:pb-[30px]">
      <SubCategoryTabs
        className="md:hidden"
        categories={selected?.parent.children ?? []}
        selectedId={selected?.child?.id}
        onSelect={(id) => updateQuery('categoryId', String(id), 'push')}
      />

      <div className="flex px-6 md:gap-5 md:px-0 lg:mx-auto lg:max-w-[1400px] lg:gap-10">
        <aside aria-label="카테고리" className="hidden shrink-0 md:block">
          <SubCategoryMenu
            categories={PRODUCT_CATEGORIES}
            selectedCategoryId={selected?.child?.id}
            onSelect={(id) => updateQuery('categoryId', String(id), 'push')}
          />
        </aside>

        <section className="flex min-w-0 flex-1 flex-col gap-5 md:gap-[30px]">
          <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between md:gap-0 md:border-b md:border-primary-100 md:pb-5">
            {selected && (
              <nav
                aria-label="현재 카테고리"
                className="flex items-center gap-1 pt-3.5 pb-2.5 text-14-regular md:p-0 lg:text-16-regular"
              >
                <span className="text-primary-300">{selected.parent.name}</span>
                {selected.child && (
                  <>
                    <ChevronRightIcon className="size-4 text-primary-300" />
                    <span className="text-primary-950">
                      {selected.child.name}
                    </span>
                  </>
                )}
              </nav>
            )}

            <div className="flex items-center justify-between border-b border-primary-100 pb-5 md:justify-start md:gap-[30px] md:border-0 md:pb-0">
              <DropdownButton
                value={sort}
                onChange={(value) => updateQuery('sort', value, 'replace')}
                placeholder="정렬"
                containerClassName="w-[110px]"
                className="h-11 border-primary-100 px-4 py-2.5 text-16-regular"
                listClassName="border-primary-100"
              >
                {SORT_OPTIONS.map(({ value, label }) => (
                  <DropdownItem
                    key={value}
                    value={value}
                    className="h-[50px] pr-5 pl-4 text-16-regular hover:bg-primary-25"
                  >
                    {label}
                  </DropdownItem>
                ))}
              </DropdownButton>

              <button
                type="button"
                onClick={handleOpenCreateModal}
                className="flex h-11 items-center gap-1.5 rounded-[4px] bg-primary-950 px-4 text-14-bold text-white"
              >
                <PlusMinusIcon className="size-4" />
                상품 등록
              </button>
            </div>
          </div>

          {isError ? (
            <div className="flex flex-col items-center gap-4 py-20">
              <p className="text-16-regular text-primary-600">
                {error.message}
              </p>
              <button
                type="button"
                onClick={() => void refetch()}
                className="h-11 rounded-[4px] border border-primary-200 px-4 text-14-bold text-primary-950"
              >
                다시 시도
              </button>
            </div>
          ) : isPending ? (
            <ul className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-3.5 md:gap-y-[50px] lg:gap-x-10 lg:gap-y-[60px]">
              {Array.from({ length: 6 }, (_, index) => (
                <li key={index} className="flex flex-col gap-3">
                  <div className="aspect-square w-full animate-pulse bg-primary-50" />
                  <div className="h-4 w-2/3 animate-pulse bg-primary-50" />
                  <div className="h-4 w-1/3 animate-pulse bg-primary-50" />
                </li>
              ))}
            </ul>
          ) : products.length === 0 ? (
            <p className="py-20 text-center text-16-regular text-primary-400">
              등록된 상품이 없습니다.
            </p>
          ) : (
            <>
              <ul className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-3.5 md:gap-y-[50px] lg:gap-x-10 lg:gap-y-[60px]">
                {products.map((product) => (
                  <li key={product.id} className="relative">
                    <ProductCard
                      imageSrc={product.imageUrl ?? photoIcon.src}
                      imageAlt={product.name}
                      name={product.name}
                      price={product.price}
                      purchaseCount={product.purchaseCount}
                      className="max-w-none"
                      // 이미지가 없으면 사진 아이콘을 흐리게 깔아 자리만 표시한다.
                      imageClassName={
                        product.imageUrl ? undefined : 'opacity-15'
                      }
                      // 카드 전체를 덮는 링크 위로 올려서 찜 버튼이 먼저 눌리게 한다.
                      likeButtonClassName="relative z-20"
                    />
                    <Link
                      href={`/products/${product.id}`}
                      aria-label={product.name}
                      className="absolute inset-0 z-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-950"
                    />
                  </li>
                ))}
              </ul>

              <div ref={sentinelRef} aria-hidden className="h-px" />

              {isFetchingNextPage && (
                <p className="py-5 text-center text-14-regular text-primary-400">
                  불러오는 중…
                </p>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
