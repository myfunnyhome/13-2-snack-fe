'use client';

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

const APPROVE_REQUEST_ITEMS = [
  {
    id: 1,
    productName: '코카콜라',
    imageUrl: colaImage.src,
    quantity: 2,
    priceAtOrder: 2000,
    totalPrice: 4000,
  },
  {
    id: 2,
    productName: '코카콜라 제로',
    imageUrl: colaImage.src,
    quantity: 1,
    priceAtOrder: 2500,
    totalPrice: 2500,
  },
];

type ProductFormModalContainerProps = {
  mode: 'create' | 'edit';
};

function ProductFormModalContainer({ mode }: ProductFormModalContainerProps) {
  const { closeModal } = useModal();

  const isEditMode = mode === 'edit';

  const categorySlot = (
    <>
      <div className="flex h-14 min-w-0 flex-1 items-center border border-primary-200 bg-white px-4 text-16-regular text-primary-500">
        대분류
      </div>

      <div className="flex h-14 min-w-0 flex-1 items-center border border-primary-200 bg-white px-4 text-16-regular text-primary-500">
        소분류
      </div>
    </>
  );

  const handleConfirm = (formData: ProductFormData): void => {
    console.log(isEditMode ? '상품 수정' : '상품 등록', formData);
    closeModal();
  };

  return (
    <ProductFormModal
      title={isEditMode ? '상품 수정' : '상품 등록'}
      confirmButtonText={isEditMode ? '수정하기' : '등록하기'}
      imageUrl={isEditMode ? colaImage.src : null}
      onImageSelect={() => {
        console.log('상품 이미지 선택');
      }}
      onImageRemove={() => {
        console.log('상품 이미지 삭제');
      }}
      categorySlot={categorySlot}
      productName={isEditMode ? '코카콜라' : undefined}
      price={isEditMode ? '2000' : undefined}
      productUrl={isEditMode ? 'https://www.codeit.kr' : undefined}
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
        onClick={() => openModal(<ProductFormModalContainer mode="edit" />)}
      >
        상품 수정 모달
      </button>

      <button
        type="button"
        onClick={() =>
          openModal(
            <ApproveRequestModal
              variant="approve"
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

      <button
        type="button"
        onClick={() =>
          openModal(
            <ApproveRequestModal
              variant="reject"
              requesterName="김스낵"
              requesterInitials="김스"
              items={APPROVE_REQUEST_ITEMS}
              orderAmount={6500}
              deliveryFee={3000}
              totalAmount={9500}
              onConfirm={(formData) => {
                console.log('구매 요청 반려', formData);
                closeModal();
              }}
            />,
          )
        }
      >
        구매 요청 반려 모달
      </button>
    </div>
  );
}
