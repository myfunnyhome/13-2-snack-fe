'use client';

import { useState } from 'react';

import DropdownButton from '@/components/ui/Dropdown/DropdownButton';
import DropdownItem from '@/components/ui/Dropdown/DropdownItem';

import { PRODUCT_CATEGORIES } from './productCategories';

type CategorySelectFieldsProps = {
  initialMainCategoryId?: number;
  initialSubCategoryId?: number;
  /** 소분류가 정해질 때만 값이 오고, 대분류를 바꾸면 undefined가 온다. */
  onSubCategoryChange?: (categoryId: number | undefined) => void;
};

// 모달 내용은 열 때 한 번만 전달되므로 선택 상태를 이 컴포넌트가 직접 가진다.
export default function CategorySelectFields({
  initialMainCategoryId,
  initialSubCategoryId,
  onSubCategoryChange,
}: CategorySelectFieldsProps) {
  const [mainCategoryId, setMainCategoryId] = useState<string | undefined>(
    initialMainCategoryId ? String(initialMainCategoryId) : undefined,
  );
  const [subCategoryId, setSubCategoryId] = useState<string | undefined>(
    initialSubCategoryId ? String(initialSubCategoryId) : undefined,
  );
  const subCategories =
    PRODUCT_CATEGORIES.find(({ id }) => String(id) === mainCategoryId)
      ?.children ?? [];

  function handleMainCategoryChange(value: string): void {
    setMainCategoryId(value);
    setSubCategoryId(undefined);
    onSubCategoryChange?.(undefined);
  }

  function handleSubCategoryChange(value: string): void {
    setSubCategoryId(value);
    onSubCategoryChange?.(Number(value));
  }

  const fieldClassName = 'h-14 border-primary-200 px-4 text-16-regular';
  const itemClassName = 'h-[50px] text-16-regular hover:bg-primary-25';

  return (
    <>
      <DropdownButton
        value={mainCategoryId}
        onChange={handleMainCategoryChange}
        placeholder="대분류"
        containerClassName="min-w-0 flex-1"
        className={fieldClassName}
        listClassName="border-primary-200"
      >
        {PRODUCT_CATEGORIES.map(({ id, name }) => (
          <DropdownItem key={id} value={String(id)} className={itemClassName}>
            {name}
          </DropdownItem>
        ))}
      </DropdownButton>

      <DropdownButton
        value={subCategoryId}
        onChange={handleSubCategoryChange}
        placeholder="소분류"
        containerClassName="min-w-0 flex-1"
        className={fieldClassName}
        listClassName="border-primary-200"
      >
        {subCategories.map(({ id, name }) => (
          <DropdownItem key={id} value={String(id)} className={itemClassName}>
            {name}
          </DropdownItem>
        ))}
      </DropdownButton>
    </>
  );
}
