'use client';

import { type ReactNode } from 'react';

import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import photoIcon from '@/assets/icons/photo.svg';
import CloseIcon from '@/components/icons/CloseIcon';
import Button from '@/components/ui/Button/Button';
import ProductImage from '@/components/ui/ProductImage/ProductImage';
import TextField from '@/components/ui/TextField/TextFieldInput';
import { useModal } from '@/providers/ModalProvider';
import { cn } from '@/utils/cn';

type ProductFormData = {
  name: string;
  price: string;
  productUrl: string;
};

// BE createProductSchema(product.schema.ts) 기준
const PRODUCT_NAME_MAX_LENGTH = 100;
const PRODUCT_PRICE_MAX = 100_000_000;

type ProductFormModalProps = {
  title: string;
  confirmButtonText: string;
  imageUrl?: string | null;
  onImageSelect?: () => void;
  onImageRemove?: () => void;
  categorySlot: ReactNode;
  productName?: string;
  price?: string;
  productUrl?: string;
  onConfirm: (formData: ProductFormData) => void;
  className?: string;
};

export type { ProductFormData };

export default function ProductFormModal({
  title,
  confirmButtonText,
  imageUrl = null,
  onImageSelect,
  onImageRemove,
  categorySlot,
  productName = '',
  price = '',
  productUrl = '',
  onConfirm,
  className,
}: ProductFormModalProps) {
  const { closeModal } = useModal();

  const {
    register,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormData>({
    defaultValues: { name: productName, price, productUrl },
  });

  const name = watch('name');
  const priceValue = watch('price');
  const productUrlValue = watch('productUrl');

  const handleFormSubmit = handleSubmit((formValues) => {
    onConfirm(formValues);
  });

  return (
    <form
      onSubmit={handleFormSubmit}
      className={cn(
        'flex h-dvh w-screen flex-col bg-white px-6 pt-4 pb-6',
        'md:h-auto md:w-[90vw] md:max-w-[512px] md:rounded-md md:p-[30px]',
        'md:drop-shadow-[0px_0px_15px_rgba(0,0,0,0.14)]',
        className,
      )}
    >
      <h2 className="flex h-7 items-center justify-center text-18-bold text-primary-950 md:h-auto">
        {title}
      </h2>

      <div className="mt-[30px] flex w-full flex-col items-center md:mt-7.5">
        <div className="relative size-[140px]">
          {imageUrl ? (
            <>
              <ProductImage
                src={imageUrl}
                alt="상품 이미지"
                size={140}
                background="bg-white"
                className="rounded-xs border border-black/10 shadow-[4px_4px_10px_rgba(250,247,243,0.25)]"
              />

              <button
                type="button"
                aria-label="상품 이미지 삭제"
                onClick={onImageRemove}
                className="absolute top-2.5 right-2.5 flex size-6 items-center justify-center text-primary-950"
              >
                <CloseIcon className="size-6" />
              </button>
            </>
          ) : (
            <div className="flex size-[140px] items-center justify-center rounded-xs border border-primary-200 bg-white">
              <button
                type="button"
                aria-label="상품 이미지 선택"
                onClick={onImageSelect}
                className="flex size-10 items-center justify-center"
              >
                <Image
                  src={photoIcon}
                  alt=""
                  width={30}
                  height={30}
                  aria-hidden
                />
              </button>
            </div>
          )}
        </div>

        <div className="mt-[30px] flex w-full gap-5 md:mt-7.5">
          {categorySlot}
        </div>

        <div className="mt-7.5 flex w-full flex-col gap-7.5">
          <TextField
            label={name ? '상품명' : undefined}
            placeholder="상품명을 입력해주세요"
            errorMessage={errors.name?.message}
            className="w-full"
            {...register('name', {
              required: '상품명을 입력해주세요',
              // BE createProductSchema: trim 후 1~100자
              validate: (value) => {
                const trimmed = value.trim();

                if (trimmed.length === 0) {
                  return '상품명을 입력해주세요';
                }

                if (trimmed.length > PRODUCT_NAME_MAX_LENGTH) {
                  return `${PRODUCT_NAME_MAX_LENGTH}자 이하로 입력해주세요`;
                }

                return true;
              },
            })}
          />

          <TextField
            label={priceValue ? '가격' : undefined}
            placeholder="가격을 입력해주세요"
            inputMode="numeric"
            errorMessage={errors.price?.message}
            className="w-full"
            {...register('price', {
              required: '가격을 입력해주세요',
              // BE createProductSchema: 정수, 0~100,000,000
              validate: (value) => {
                const trimmed = value.trim();

                if (trimmed.length === 0) {
                  return '가격을 입력해주세요';
                }

                if (!/^\d+$/.test(trimmed)) {
                  return '숫자만 입력해주세요';
                }

                if (Number(trimmed) > PRODUCT_PRICE_MAX) {
                  return '1억 이하로 입력해주세요';
                }

                return true;
              },
            })}
          />

          <TextField
            label={productUrlValue ? '제품 링크' : undefined}
            placeholder="제품 링크를 입력해주세요"
            errorMessage={errors.productUrl?.message}
            className="w-full"
            {...register('productUrl', {
              // BE createProductSchema: 선택 입력, 값이 있으면 z.url() 형식
              validate: (value) => {
                const trimmed = value.trim();

                if (trimmed.length === 0) {
                  return true;
                }

                return (
                  z.url().safeParse(trimmed).success ||
                  '올바른 URL 형식이 아닙니다'
                );
              },
            })}
          />
        </div>
      </div>

      <div className="mt-auto flex w-full gap-4 md:mt-9 md:gap-5">
        <Button
          type="button"
          text="취소"
          variant="secondary"
          onClick={closeModal}
          className="h-16 flex-1 py-0 text-16-bold"
        />

        <Button
          type="submit"
          text={confirmButtonText}
          className="h-16 flex-1 border border-transparent py-0 text-16-bold"
        />
      </div>
    </form>
  );
}
