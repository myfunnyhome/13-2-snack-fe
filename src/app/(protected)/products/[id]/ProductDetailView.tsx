'use client';

import { useRouter } from 'next/navigation';

import colaZeroImage from '@/assets/images/cola_zero.png';
import SubCategoryMenu from '@/components/ui/List/SubCategoryMenu';
import { DeleteConfirmModal, ProductFormModal } from '@/components/ui/Modal';
import ProductDetail, {
  type ProductDetailSection,
} from '@/components/ui/ProductDetail/ProductDetail';
import { useModal } from '@/providers/ModalProvider';
import { cn } from '@/utils/cn';

import CategorySelectFields from '../CategorySelectFields';
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
- MOCK_* 는 상품 API 연결 전 임시 데이터다.
*/

const MOCK_PRODUCT = {
  id: 1,
  name: '코카콜라 제로',
  price: 2000,
  purchaseCount: 29,
  categoryId: 21,
  imageSrc: colaZeroImage.src,
  imageAlt: '코카콜라 제로 350ml 캔',
  productUrl: 'https://www.coca-cola.co.kr',
  isLiked: false,
};

// TODO: API 연결 시 로그인 사용자와 등록자를 비교한다. ADMIN 이상은 모든 상품에 노출.
const CAN_MANAGE_PRODUCT = true;

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
  const { openModal, closeModal } = useModal();

  const selected =
    findCategory(MOCK_PRODUCT.categoryId) ?? findCategory(DEFAULT_CATEGORY_ID);

  // 상세에서 카테고리를 고르면 그 카테고리의 리스트로 이동한다.
  function moveToCategory(categoryId: number): void {
    router.push(`/products?categoryId=${categoryId}`);
  }

  function handleEditProduct(): void {
    openModal(
      <ProductFormModal
        title="상품 수정"
        confirmButtonText="수정하기"
        imageUrl={MOCK_PRODUCT.imageSrc}
        productName={MOCK_PRODUCT.name}
        price={String(MOCK_PRODUCT.price)}
        productUrl={MOCK_PRODUCT.productUrl}
        categorySlot={
          <CategorySelectFields
            initialMainCategoryId={selected?.parent.id}
            initialSubCategoryId={selected?.child?.id}
          />
        }
        // TODO: 상품 수정 API 연결
        onConfirm={closeModal}
      />,
    );
  }

  function handleDeleteProduct(): void {
    openModal(
      <DeleteConfirmModal
        variant="product"
        targetName={MOCK_PRODUCT.name}
        // TODO: 상품 삭제 API 연결 후 리스트로 이동
        onConfirm={closeModal}
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
          <ProductDetail
            className={cn(
              // 바깥 여백은 이 페이지가 잡는다.
              'max-w-none px-0 pt-0 pb-0 md:pt-0 lg:pt-0',
              // 경로 줄 높이를 피그마에 맞춘다(모바일 41, 태블릿부터 64).
              // 구분선 아래 간격 30은 컴포넌트 값 그대로 쓴다.
              '[&>hr]:mt-[25px] md:[&>hr]:mt-12',
              // 태블릿은 본문이 496px뿐이라 피그마처럼 이미지와 정보를 세로로 쌓는다.
              'md:[&>div:last-child]:grid-cols-1',
              // PC는 이미지 540 + 간격 36 + 정보 604 = 1180으로 피그마 폭에 맞춘다.
              // 위 md 규칙과 같은 우선순위로 다시 적어야 PC에서 2단이 된다.
              'lg:[&>div:last-child]:grid-cols-[540px_604px]',
              'lg:[&>div:last-child]:gap-9',
            )}
            imageClassName="bg-white shadow-[4px_4px_10px_rgba(250,247,243,0.25)]"
            // 장바구니 버튼은 피그마에서 정보 영역 전체 폭이다.
            cartButtonClassName="lg:w-auto lg:flex-1"
            // 아코디언 여백 40, 제목은 태블릿까지 18 Bold.
            sectionButtonClassName="py-10 [&>span]:text-18-bold lg:[&>span]:text-20-bold"
            // 수정·삭제 권한이 없으면 ⋮ 자체를 감춘다.
            optionButtonClassName={CAN_MANAGE_PRODUCT ? undefined : 'hidden'}
            category={selected?.parent.name ?? ''}
            subcategory={selected?.child?.name ?? ''}
            productName={MOCK_PRODUCT.name}
            purchaseCount={MOCK_PRODUCT.purchaseCount}
            price={MOCK_PRODUCT.price}
            imageSrc={MOCK_PRODUCT.imageSrc}
            imageAlt={MOCK_PRODUCT.imageAlt}
            isInitiallyLiked={MOCK_PRODUCT.isLiked}
            detailSections={DETAIL_SECTIONS}
            onEditProduct={CAN_MANAGE_PRODUCT ? handleEditProduct : undefined}
            onDeleteProduct={
              CAN_MANAGE_PRODUCT ? handleDeleteProduct : undefined
            }
          />
        </section>
      </div>
    </div>
  );
}
