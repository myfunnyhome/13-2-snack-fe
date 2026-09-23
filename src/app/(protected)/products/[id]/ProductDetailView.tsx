'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';

import photoIcon from '@/assets/icons/photo.svg';
import SubCategoryMenu from '@/components/ui/List/SubCategoryMenu';
import { DeleteConfirmModal } from '@/components/ui/Modal';
import ProductDetail, {
  type ProductDetailSection,
} from '@/components/ui/ProductDetail/ProductDetail';
import {
  type ProductDetail as Product,
  deleteProduct,
  getProduct,
} from '@/lib/services/productService';
import { useAuth } from '@/providers/AuthProvider';
import { useModal } from '@/providers/ModalProvider';
import { useToast } from '@/providers/ToastProvider';
import { cn } from '@/utils/cn';

import ProductFormModalContainer from '../ProductFormModalContainer';
import SubCategoryTabs from '../SubCategoryTabs';
import {
  DEFAULT_CATEGORY_ID,
  MOCK_CATEGORIES,
  findCategory,
} from '../productCategories';

/*
@ 상품 상세
- 화면 구성은 공용 ProductDetail이 담당하고, 이 파일은 배치·권한·모달 연결만 한다.
- 공용 컴포넌트는 수정하지 않고, 컴포넌트가 열어둔 className prop으로 피그마 수치에 맞춘다.
*/

const DETAIL_SECTIONS: readonly ProductDetailSection[] = [
  {
    key: 'benefit',
    label: '구매혜택',
    content: '5포인트 적립 예정',
  },
  {
    key: 'delivery',
    label: '배송 방법',
    content: '택배',
  },
  {
    key: 'deliveryFee',
    label: '배송비',
    content: (
      <span className="whitespace-nowrap">
        <span className="text-primary-600">
          3,000원 (50,000원 이상 무료 배송)
        </span>
        <span className="ml-2 text-primary-400">도서산간 배송비 추가</span>
      </span>
    ),
  },
];

export default function ProductDetailView() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const productId = Number(params.id);
  const { user } = useAuth();
  const { openModal, closeModal } = useModal();
  const toast = useToast();
  const queryClient = useQueryClient();

  const {
    data: product,
    isPending,
    isError,
    error,
  } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => getProduct(productId),
    enabled: Number.isInteger(productId) && productId > 0,
  });

  const { mutate: removeProduct } = useMutation({
    mutationFn: () => deleteProduct(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.open({ text: '상품을 삭제했습니다.' });
      closeModal();
      router.push('/products');
    },
    onError: (deleteError: Error) => {
      toast.open({ text: deleteError.message });
    },
  });

  // TODO: 작성자 본인 여부는 상세 API에 isMine이 추가되면 그 값으로 바꾼다.
  const canManageProduct =
    user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  const selected =
    findCategory(product?.category.id ?? DEFAULT_CATEGORY_ID) ??
    findCategory(DEFAULT_CATEGORY_ID);

  // 상세에서 카테고리를 고르면 그 카테고리의 리스트로 이동한다.
  function moveToCategory(categoryId: number): void {
    router.push(`/products?categoryId=${categoryId}`);
  }

  function handleEditProduct(savedProduct: Product): void {
    openModal(<ProductFormModalContainer mode="edit" product={savedProduct} />);
  }

  function handleDeleteProduct(targetName: string): void {
    openModal(
      <DeleteConfirmModal
        variant="product"
        targetName={targetName}
        onConfirm={() => removeProduct()}
      />,
    );
  }

  return (
    <div className="pb-10 md:px-6 lg:px-5 lg:pt-20 lg:pb-[30px]">
      <SubCategoryTabs
        className="md:hidden"
        categories={selected?.parent.children ?? []}
        selectedId={selected?.child?.id}
        onSelect={moveToCategory}
      />

      <div className="flex px-6 md:gap-5 md:px-0 lg:mx-auto lg:max-w-[1400px] lg:gap-10">
        <aside aria-label="카테고리" className="hidden shrink-0 md:block">
          <SubCategoryMenu
            categories={MOCK_CATEGORIES}
            selectedCategoryId={selected?.child?.id}
            onSelect={moveToCategory}
          />
        </aside>

        <section className="min-w-0 flex-1">
          {isError ? (
            <p className="py-20 text-center text-16-regular text-primary-600">
              {error.message}
            </p>
          ) : isPending ? (
            <div className="flex flex-col gap-8 py-10 lg:flex-row">
              <div className="aspect-square w-full animate-pulse bg-primary-50 lg:w-[540px]" />
              <div className="flex flex-1 flex-col gap-4">
                <div className="h-6 w-1/2 animate-pulse bg-primary-50" />
                <div className="h-6 w-1/4 animate-pulse bg-primary-50" />
                <div className="h-16 w-full animate-pulse bg-primary-50" />
              </div>
            </div>
          ) : (
            <ProductDetail
              className={cn(
                // 바깥 여백은 이 페이지가 잡는다.
                'max-w-none px-0 pt-0 pb-0 md:pt-0 lg:pt-0',
                // 경로 줄 높이를 피그마에 맞춘다(모바일 41, 태블릿부터 64).
                '[&>hr]:mt-[25px] md:[&>hr]:mt-12',
                // 태블릿은 본문이 496px뿐이라 피그마처럼 이미지와 정보를 세로로 쌓는다.
                'md:[&>div:last-child]:grid-cols-1',
                // PC는 이미지 540 + 간격 36 + 정보 604 = 1180으로 피그마 폭에 맞춘다.
                'lg:[&>div:last-child]:grid-cols-[540px_604px]',
                'lg:[&>div:last-child]:gap-9',
              )}
              imageClassName={cn(
                'bg-white shadow-[4px_4px_10px_rgba(250,247,243,0.25)]',
                // 이미지가 없으면 사진 아이콘을 흐리게 깔아 자리만 표시한다.
                !product.imageUrl && 'opacity-15',
              )}
              cartButtonClassName="lg:w-auto lg:flex-1"
              sectionButtonClassName="py-10 [&>span]:text-18-bold lg:[&>span]:text-20-bold"
              optionButtonClassName={canManageProduct ? undefined : 'hidden'}
              category={selected?.parent.name ?? ''}
              subcategory={selected?.child?.name ?? product.category.name}
              productName={product.name}
              purchaseCount={product.purchaseCount}
              price={product.price}
              imageSrc={product.imageUrl ?? photoIcon.src}
              imageAlt={product.name}
              isInitiallyLiked={false}
              detailSections={DETAIL_SECTIONS}
              onEditProduct={
                canManageProduct ? () => handleEditProduct(product) : undefined
              }
              onDeleteProduct={
                canManageProduct
                  ? () => handleDeleteProduct(product.name)
                  : undefined
              }
            />
          )}
        </section>
      </div>
    </div>
  );
}
