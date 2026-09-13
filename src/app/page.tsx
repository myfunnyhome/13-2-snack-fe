'use client';

import { useEffect, useState } from 'react';

import colaImage from '@/assets/images/cola.png';
import {
  ApproveRequestModal,
  DeleteConfirmModal,
  InviteMemberModal,
  ProductFormModal,
  WithdrawConfirmModal,
} from '@/components/ui/Modal';
import type { ProductFormData } from '@/components/ui/Modal/ProductFormModal';
import { useModal } from '@/providers/ModalProvider';

const CATEGORIES = [
  { id: 1, name: '음료', parentId: null },
  { id: 2, name: '간식', parentId: null },
  { id: 11, name: '청량 · 탄산 음료', parentId: 1 },
  { id: 12, name: '커피', parentId: 1 },
  { id: 13, name: '생수', parentId: 1 },
  { id: 21, name: '과자', parentId: 2 },
];

const MAIN_CATEGORY_OPTIONS = CATEGORIES.filter(
  (category) => category.parentId === null,
);

const APPROVE_REQUEST_ITEMS = [
  {
    id: 1,
    productName: '코카콜라',
    imageUrl: colaImage.src,
    quantity: 2,
    priceAtOrder: 2000,
  },
  {
    id: 2,
    productName: '코카콜라 제로',
    imageUrl: colaImage.src,
    quantity: 1,
    priceAtOrder: 2500,
  },
];

type ProductFormModalContainerProps = {
  mode: 'create' | 'edit';
  imageUrl?: string | null;
  categoryId?: number | null;
  productName?: string;
  price?: number;
  productUrl?: string;
};

function ProductFormModalContainer({
  mode,
  imageUrl = null,
  categoryId = null,
  productName,
  price,
  productUrl,
}: ProductFormModalContainerProps) {
  const { closeModal } = useModal();

  const [savedImageUrl, setSavedImageUrl] = useState<string | null>(imageUrl);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  const [mainCategoryId, setMainCategoryId] = useState<number | null>(
    () =>
      CATEGORIES.find((category) => category.id === categoryId)?.parentId ??
      null,
  );

  useEffect(() => {
    if (!objectUrl) return;

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [objectUrl]);

  const categoryOptions =
    mainCategoryId === null
      ? []
      : CATEGORIES.filter((category) => category.parentId === mainCategoryId);

  const handleImageSelect = (file: File): void => {
    setObjectUrl(URL.createObjectURL(file));
    setSavedImageUrl(null);
  };

  const handleImageRemove = (): void => {
    setObjectUrl(null);
    setSavedImageUrl(null);
  };

  const handleConfirm = (formData: ProductFormData): void => {
    console.log(mode === 'edit' ? '상품 수정' : '상품 등록', formData);
    closeModal();
  };

  return (
    <ProductFormModal
      mode={mode}
      imageUrl={objectUrl ?? savedImageUrl}
      mainCategoryOptions={MAIN_CATEGORY_OPTIONS}
      categoryOptions={categoryOptions}
      initialMainCategoryId={mainCategoryId}
      initialCategoryId={categoryId}
      productName={productName}
      price={price}
      productUrl={productUrl}
      onMainCategoryChange={setMainCategoryId}
      onImageSelect={handleImageSelect}
      onImageRemove={handleImageRemove}
      onConfirm={handleConfirm}
    />
  );
}

export default function Home() {
  const { openModal, closeModal } = useModal();

  return (
    <div className="flex flex-wrap gap-4 p-10">
      <button
        type="button"
        onClick={() =>
          openModal(
            <DeleteConfirmModal
              variant="product"
              targetName="코카콜라 제로"
              onConfirm={() => {
                console.log('삭제');
                closeModal();
              }}
            />,
          )
        }
      >
        삭제 모달
      </button>

      <button
        type="button"
        onClick={() =>
          openModal(
            <DeleteConfirmModal
              variant="purchaseRequest"
              targetName="코카콜라 외 1건"
              onConfirm={() => {
                console.log('요청 취소');
                closeModal();
              }}
            />,
          )
        }
      >
        요청 취소 모달
      </button>

      <button
        type="button"
        onClick={() =>
          openModal(
            <WithdrawConfirmModal
              name="김스낵"
              email="sn@codeit.com"
              onConfirm={() => {
                console.log('탈퇴');
                closeModal();
              }}
            />,
          )
        }
      >
        탈퇴 모달
      </button>

      <button
        type="button"
        onClick={() =>
          openModal(
            <InviteMemberModal
              onSubmit={(formData) => {
                console.log('회원 초대', formData);
                closeModal();
              }}
            />,
          )
        }
      >
        회원 초대 모달
      </button>

      <button
        type="button"
        onClick={() => openModal(<ProductFormModalContainer mode="create" />)}
      >
        상품 등록 모달
      </button>

      <button
        type="button"
        onClick={() =>
          openModal(
            <ProductFormModalContainer
              mode="edit"
              imageUrl={colaImage.src}
              categoryId={11}
              productName="코카콜라"
              price={2000}
              productUrl="https://www.codeit.kr"
            />,
          )
        }
      >
        상품 수정 모달
      </button>

      <button
        type="button"
        onClick={() =>
          openModal(
            <ApproveRequestModal
              requesterName="김스낵"
              requesterInitials="김스"
              items={APPROVE_REQUEST_ITEMS}
              orderAmount={6500}
              deliveryFee={3000}
              totalAmount={9500}
              remainingBudget={90500}
              onConfirm={(formData) => {
                console.log('구매 요청 승인', formData);
                closeModal();
              }}
            />,
          )
        }
      >
        구매 요청 승인 모달
      </button>
    </div>
  );
}
