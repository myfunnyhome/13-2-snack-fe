'use client';

import { useEffect, useRef, useState } from 'react';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { ProductFormModal } from '@/components/ui/Modal';
import type { ProductFormData } from '@/components/ui/Modal/ProductFormModal';
import {
  type ProductDetail,
  createProduct,
  updateProduct,
  uploadProductImage,
} from '@/lib/services/productService';
import { useModal } from '@/providers/ModalProvider';
import { useToast } from '@/providers/ToastProvider';

import CategorySelectFields from './CategorySelectFields';
import { findCategory } from './productCategories';

/*
@ 상품 등록·수정 모달
- 모달 내용은 열 때 한 번만 전달되므로, 이미지·카테고리 선택 상태를 이 컴포넌트가 직접 가진다.
- 이미지는 확인을 누를 때 업로드하고, 받은 주소를 상품에 저장한다.
*/

type ProductFormModalContainerProps = {
  mode: 'create' | 'edit';
  /** 수정일 때만 필요하다. */
  product?: ProductDetail;
  onSuccess?: (product: ProductDetail) => void;
};

const MODAL_TEXT = {
  create: { title: '상품 등록', confirmButtonText: '등록하기' },
  edit: { title: '상품 수정', confirmButtonText: '수정하기' },
} as const;

function toPrice(value: string): number {
  return Number(value.replace(/,/g, '').trim());
}

export default function ProductFormModalContainer({
  mode,
  product,
  onSuccess,
}: ProductFormModalContainerProps) {
  const { closeModal } = useModal();
  const toast = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selected = product ? findCategory(product.category.id) : null;
  const [categoryId, setCategoryId] = useState<number | undefined>(
    product?.category.id,
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isImageRemoved, setIsImageRemoved] = useState<boolean>(false);

  // 미리보기 주소는 브라우저 메모리를 잡고 있어서 바뀌거나 닫힐 때 풀어준다.
  useEffect(() => {
    if (!previewUrl) {
      return;
    }

    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const { mutate: submitProduct, isPending } = useMutation({
    mutationFn: async (formData: ProductFormData): Promise<ProductDetail> => {
      let imageUrl = isImageRemoved ? null : (product?.imageUrl ?? null);

      if (imageFile) {
        const uploaded = await uploadProductImage(imageFile);
        imageUrl = uploaded.imageUrl;
      }

      const input = {
        name: formData.name.trim(),
        price: toPrice(formData.price),
        categoryId: categoryId as number,
        imageUrl,
        productUrl: formData.productUrl.trim() || null,
      };

      return mode === 'create'
        ? createProduct(input)
        : updateProduct(product!.id, input);
    },
    onSuccess: (savedProduct) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', savedProduct.id] });
      toast.open({
        text:
          mode === 'create' ? '상품을 등록했습니다.' : '상품을 수정했습니다.',
      });
      closeModal();
      onSuccess?.(savedProduct);
    },
    onError: (error: Error) => {
      toast.open({ text: error.message });
    },
  });

  function handleImageSelect(): void {
    fileInputRef.current?.click();
  }

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setIsImageRemoved(false);
    // 같은 파일을 다시 골라도 change가 일어나게 값을 비운다.
    event.target.value = '';
  }

  function handleImageRemove(): void {
    setImageFile(null);
    setPreviewUrl(null);
    setIsImageRemoved(true);
  }

  function handleConfirm(formData: ProductFormData): void {
    if (isPending) {
      return;
    }

    if (formData.name.trim() === '') {
      toast.open({ text: '상품명을 입력해주세요.' });
      return;
    }

    const price = toPrice(formData.price);

    if (!Number.isInteger(price) || price < 0) {
      toast.open({ text: '가격은 0 이상의 숫자로 입력해주세요.' });
      return;
    }

    if (!categoryId) {
      toast.open({ text: '소분류까지 선택해주세요.' });
      return;
    }

    submitProduct(formData);
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleImageChange}
        className="hidden"
      />

      <ProductFormModal
        title={MODAL_TEXT[mode].title}
        confirmButtonText={MODAL_TEXT[mode].confirmButtonText}
        imageUrl={previewUrl ?? (isImageRemoved ? null : product?.imageUrl)}
        onImageSelect={handleImageSelect}
        onImageRemove={handleImageRemove}
        categorySlot={
          <CategorySelectFields
            initialMainCategoryId={selected?.parent.id}
            initialSubCategoryId={selected?.child?.id}
            onSubCategoryChange={setCategoryId}
          />
        }
        productName={product?.name}
        price={product ? String(product.price) : undefined}
        productUrl={product?.productUrl ?? undefined}
        onConfirm={handleConfirm}
      />
    </>
  );
}
