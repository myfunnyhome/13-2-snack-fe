'use client';

import { type ChangeEvent, type FormEvent, useRef, useState } from 'react';

import Image from 'next/image';

import closeIcon from '@/assets/icons/close.svg';
import photoIcon from '@/assets/icons/photo.svg';
import Button from '@/components/ui/Button/Button';
import DropdownButton from '@/components/ui/Dropdown/DropdownButton';
import DropdownItem from '@/components/ui/Dropdown/DropdownItem';
import ProductImage from '@/components/ui/ProductImage/ProductImage';
import TextField from '@/components/ui/TextField/TextFieldInput';
import { useModal } from '@/providers/ModalProvider';
import { cn } from '@/utils/cn';
import { parseWonAmount } from '@/utils/toKoreanWon';

type ProductFormMode = 'create' | 'edit';

type CategoryOption = {
  id: number;
  name: string;
};

type ProductFormData = {
  categoryId: number | null;
  name: string;
  price: number | null;
  productUrl: string;
  imageFile: File | null;
};

type ProductFormModalProps = {
  mode?: ProductFormMode;
  imageUrl?: string | null;
  mainCategoryOptions: CategoryOption[];
  categoryOptions: CategoryOption[];
  initialMainCategoryId?: number | null;
  initialCategoryId?: number | null;
  productName?: string;
  price?: number;
  productUrl?: string;
  onImageSelect?: (file: File) => void;
  onImageRemove?: () => void;
  onMainCategoryChange?: (mainCategoryId: number) => void;
  onConfirm: (formData: ProductFormData) => void;
  className?: string;
};

export type { ProductFormData, ProductFormMode, CategoryOption };

export default function ProductFormModal({
  mode = 'create',
  imageUrl = null,
  mainCategoryOptions,
  categoryOptions,
  initialMainCategoryId = null,
  initialCategoryId = null,
  productName = '',
  price,
  productUrl = '',
  onImageSelect,
  onImageRemove,
  onMainCategoryChange,
  onConfirm,
  className,
}: ProductFormModalProps) {
  const { closeModal } = useModal();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [mainCategoryId, setMainCategoryId] = useState<number | null>(
    initialMainCategoryId,
  );

  const [formData, setFormData] = useState<ProductFormData>({
    categoryId: initialCategoryId,
    name: productName,
    price: price ?? null,
    productUrl,
    imageFile: null,
  });

  const isEditMode = mode === 'edit';
  const title = isEditMode ? '상품 수정' : '상품 등록';
  const confirmButtonText = isEditMode ? '수정하기' : '등록하기';

  const handleImageSelectClick = (): void => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];

    if (!file) return;

    setFormData((currentFormData) => ({
      ...currentFormData,
      imageFile: file,
    }));

    onImageSelect?.(file);
  };

  const handleImageRemoveClick = (): void => {
    setFormData((currentFormData) => ({
      ...currentFormData,
      imageFile: null,
    }));

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    onImageRemove?.();
  };

  const handleMainCategoryChange = (value: string): void => {
    const nextMainCategoryId = Number(value);

    setMainCategoryId(nextMainCategoryId);

    setFormData((currentFormData) => ({
      ...currentFormData,
      categoryId: null,
    }));

    onMainCategoryChange?.(nextMainCategoryId);
  };

  const handleCategoryChange = (value: string): void => {
    setFormData((currentFormData) => ({
      ...currentFormData,
      categoryId: Number(value),
    }));
  };

  const handleNameChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setFormData((currentFormData) => ({
      ...currentFormData,
      name: event.target.value,
    }));
  };

  const handlePriceChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const digits = event.target.value.replace(/\D/g, '');

    setFormData((currentFormData) => ({
      ...currentFormData,
      price: digits === '' ? null : parseWonAmount(digits),
    }));
  };

  const handleProductUrlChange = (
    event: ChangeEvent<HTMLInputElement>,
  ): void => {
    setFormData((currentFormData) => ({
      ...currentFormData,
      productUrl: event.target.value,
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    onConfirm(formData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        'flex w-[90vw] max-w-[512px] flex-col items-center',
        'gap-9 rounded-md bg-white p-[30px]',
        'drop-shadow-[0px_0px_15px_rgba(0,0,0,0.14)]',
        className,
      )}
    >
      <div className="flex w-full flex-col items-center gap-7.5">
        <h2 className="text-18-bold text-primary-950">{title}</h2>

        <div className="relative size-[140px]">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />

          {imageUrl ? (
            <>
              <ProductImage
                src={imageUrl}
                alt="상품 이미지"
                size={140}
                background="bg-white"
                className={cn(
                  'rounded-xs border border-black/10',
                  'shadow-[4px_4px_10px_rgba(250,247,243,0.25)]',
                )}
              />

              <button
                type="button"
                aria-label="상품 이미지 삭제"
                onClick={handleImageRemoveClick}
                className={cn(
                  'absolute top-2.5 right-2.5',
                  'flex size-6 items-center justify-center rounded-full',
                  'focus-visible:outline-2',
                  'focus-visible:outline-offset-2',
                  'focus-visible:outline-primary-950',
                )}
              >
                <Image
                  src={closeIcon}
                  alt=""
                  width={24}
                  height={24}
                  aria-hidden
                />
              </button>
            </>
          ) : (
            <button
              type="button"
              aria-label="상품 이미지 선택"
              onClick={handleImageSelectClick}
              className={cn(
                'flex size-[140px] items-center justify-center',
                'rounded-xs border border-primary-200 bg-white',
                'focus-visible:outline-2',
                'focus-visible:outline-offset-2',
                'focus-visible:outline-primary-950',
              )}
            >
              <Image
                src={photoIcon}
                alt=""
                width={30}
                height={30}
                aria-hidden
              />
            </button>
          )}
        </div>

        <div className="flex w-full gap-5">
          <DropdownButton
            containerClassName="relative min-w-0 flex-1"
            value={mainCategoryId === null ? undefined : String(mainCategoryId)}
            onChange={handleMainCategoryChange}
            placeholder="대분류"
            className={cn(
              'flex h-14 w-full items-center justify-between',
              'border bg-white px-4 text-16-regular outline-none',
              mainCategoryId !== null
                ? 'border-primary-600 text-primary-950'
                : 'border-primary-200 text-primary-500',
              'focus-visible:border-primary-600',
            )}
            listClassName={cn(
              'absolute top-full right-0 left-0 z-10',
              'border-x border-b',
              'border-primary-200 bg-white',
            )}
          >
            {mainCategoryOptions.map((category) => (
              <DropdownItem
                key={category.id}
                value={String(category.id)}
                className={cn(
                  'flex h-11 w-full items-center px-4',
                  'text-left text-16-regular text-primary-950',
                  'hover:bg-primary-25',
                  'focus-visible:bg-primary-25',
                  'focus-visible:outline-none',
                )}
              >
                {category.name}
              </DropdownItem>
            ))}
          </DropdownButton>

          <DropdownButton
            containerClassName="relative min-w-0 flex-1"
            value={
              formData.categoryId === null
                ? undefined
                : String(formData.categoryId)
            }
            onChange={handleCategoryChange}
            placeholder="소분류"
            className={cn(
              'flex h-14 w-full items-center justify-between',
              'border bg-white px-4 text-16-regular outline-none',
              formData.categoryId !== null
                ? 'border-primary-600 text-primary-950'
                : 'border-primary-200 text-primary-500',
              'focus-visible:border-primary-600',
            )}
            listClassName={cn(
              'absolute top-full right-0 left-0 z-10',
              'border-x border-b',
              'border-primary-200 bg-white',
            )}
          >
            {categoryOptions.map((category) => (
              <DropdownItem
                key={category.id}
                value={String(category.id)}
                className={cn(
                  'flex h-11 w-full items-center px-4',
                  'text-left text-16-regular text-primary-950',
                  'hover:bg-primary-25',
                  'focus-visible:bg-primary-25',
                  'focus-visible:outline-none',
                )}
              >
                {category.name}
              </DropdownItem>
            ))}
          </DropdownButton>
        </div>

        <TextField
          label={formData.name ? '상품명' : undefined}
          placeholder="상품명을 입력해주세요"
          value={formData.name}
          onChange={handleNameChange}
          className="w-full"
        />

        <TextField
          label={formData.price !== null ? '가격' : undefined}
          placeholder="가격을 입력해주세요"
          value={
            formData.price === null
              ? ''
              : formData.price.toLocaleString('ko-KR')
          }
          onChange={handlePriceChange}
          inputMode="numeric"
          className="w-full"
        />

        <TextField
          label={formData.productUrl ? '제품 링크' : undefined}
          placeholder="제품 링크를 입력해주세요"
          value={formData.productUrl}
          onChange={handleProductUrlChange}
          className="w-full"
        />
      </div>

      <div className="flex w-full gap-5">
        <Button
          type="button"
          text="취소"
          variant="secondary"
          onClick={closeModal}
          className="h-auto flex-1 py-[23px]"
        />

        <Button
          type="submit"
          text={confirmButtonText}
          className="h-auto flex-1 border border-transparent py-[23px]"
        />
      </div>
    </form>
  );
}
