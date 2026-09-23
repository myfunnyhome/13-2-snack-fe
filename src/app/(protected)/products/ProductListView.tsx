'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import colaImage from '@/assets/images/cola.png';
import colaZeroImage from '@/assets/images/cola_zero.png';
import fantaImage from '@/assets/images/fanta.png';
import spriteImage from '@/assets/images/sprite.png';
import ChevronRightIcon from '@/components/icons/ChevronRightIcon';
import PlusMinusIcon from '@/components/icons/PlusMinusIcon';
import DropdownButton from '@/components/ui/Dropdown/DropdownButton';
import DropdownItem from '@/components/ui/Dropdown/DropdownItem';
import SubCategoryMenu from '@/components/ui/List/SubCategoryMenu';
import { ProductFormModal } from '@/components/ui/Modal';
import ProductCard from '@/components/ui/ProductCard/ProductCard';
import { useModal } from '@/providers/ModalProvider';

import CategorySelectFields from './CategorySelectFields';
import SubCategoryTabs from './SubCategoryTabs';
import {
  DEFAULT_CATEGORY_ID,
  MOCK_CATEGORIES,
  findCategory,
} from './productCategories';

/*
@ 상품 리스트
- 카테고리·정렬은 URL(?categoryId=&sort=)에 둔다. 모바일에서 대분류를 고르는 GNB와 값을 공유한다.
- MOCK_* 는 상품 API 연결 전 임시 데이터다.
*/

const SORT_OPTIONS = [
  { value: 'latest', label: '최신순' },
  { value: 'popular', label: '판매순' },
  { value: 'priceAsc', label: '낮은 가격순' },
  { value: 'priceDesc', label: '높은 가격순' },
] as const;

type ProductSort = (typeof SORT_OPTIONS)[number]['value'];

type MockProduct = {
  id: number;
  name: string;
  price: number;
  purchaseCount: number;
  imageSrc: string;
  createdAt: string;
};

const MOCK_PRODUCTS: MockProduct[] = [
  {
    id: 1,
    name: '코카콜라',
    price: 2000,
    purchaseCount: 29,
    imageSrc: colaImage.src,
    createdAt: '2026-09-10',
  },
  {
    id: 2,
    name: '코카콜라 제로',
    price: 2000,
    purchaseCount: 31,
    imageSrc: colaZeroImage.src,
    createdAt: '2026-09-11',
  },
  {
    id: 3,
    name: '스프라이트',
    price: 1800,
    purchaseCount: 12,
    imageSrc: spriteImage.src,
    createdAt: '2026-09-12',
  },
  {
    id: 4,
    name: '환타 오렌지',
    price: 2400,
    purchaseCount: 8,
    imageSrc: fantaImage.src,
    createdAt: '2026-09-13',
  },
  {
    id: 5,
    name: '코카콜라 라임',
    price: 2200,
    purchaseCount: 5,
    imageSrc: colaImage.src,
    createdAt: '2026-09-14',
  },
  {
    id: 6,
    name: '스프라이트 제로',
    price: 1900,
    purchaseCount: 17,
    imageSrc: spriteImage.src,
    createdAt: '2026-09-15',
  },
];

const PRODUCT_SORTERS: Record<
  ProductSort,
  (a: MockProduct, b: MockProduct) => number
> = {
  latest: (a, b) => b.createdAt.localeCompare(a.createdAt),
  popular: (a, b) => b.purchaseCount - a.purchaseCount,
  priceAsc: (a, b) => a.price - b.price,
  priceDesc: (a, b) => b.price - a.price,
};

function isProductSort(value: string | null): value is ProductSort {
  return SORT_OPTIONS.some((option) => option.value === value);
}

export default function ProductListView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { openModal, closeModal } = useModal();

  const sortParam = searchParams.get('sort');
  const sort = isProductSort(sortParam) ? sortParam : undefined;
  const selected =
    findCategory(Number(searchParams.get('categoryId'))) ??
    findCategory(DEFAULT_CATEGORY_ID);
  const products = [...MOCK_PRODUCTS].sort(PRODUCT_SORTERS[sort ?? 'latest']);

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
    openModal(
      <ProductFormModal
        title="상품 등록"
        confirmButtonText="등록하기"
        categorySlot={<CategorySelectFields />}
        // TODO: 이미지 업로드·상품 등록 API 연결
        onConfirm={closeModal}
      />,
    );
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
            categories={MOCK_CATEGORIES}
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

          <ul className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-3.5 md:gap-y-[50px] lg:gap-x-10 lg:gap-y-[60px]">
            {products.map((product) => (
              <li key={product.id}>
                <ProductCard
                  imageSrc={product.imageSrc}
                  imageAlt={product.name}
                  name={product.name}
                  price={product.price}
                  purchaseCount={product.purchaseCount}
                  className="max-w-none"
                />
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
