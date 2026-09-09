// 사용법:
// <SubCategoryMenu categories={categories} selectedCategoryId={selectedId} onSelect={setSelectedId} />
// 상위 카테고리는 클릭하면 펼침/접힘만 함(한 번에 하나만 펼쳐짐) / 하위 카테고리 클릭 시 onSelect(id) 호출
'use client';

import { useState } from 'react';

import Image from 'next/image';

import chevronDownIcon from '@/assets/icons/chevron_down.svg';
import chevronUpIcon from '@/assets/icons/chevron_up.svg';
import { cn } from '@/utils/cn';

type SubCategory = {
  id: number;
  name: string;
};

type Category = {
  id: number;
  name: string;
  children: SubCategory[];
};

type SubCategoryMenuProps = {
  categories: Category[];
  selectedCategoryId?: number | null;
  onSelect: (categoryId: number) => void;
  className?: string;
};

export default function SubCategoryMenu({
  categories,
  selectedCategoryId,
  onSelect,
  className,
}: SubCategoryMenuProps) {
  const [expandedCategoryId, setExpandedCategoryId] = useState<number | null>(
    null,
  );

  const handleToggle = (categoryId: number) => {
    setExpandedCategoryId((prev) => (prev === categoryId ? null : categoryId));
  };

  return (
    <div className={cn('flex w-[180px] flex-col gap-2.5 bg-white', className)}>
      <div className="flex w-full items-center px-3.5 py-2.5">
        <p className="text-18-bold text-primary-950">카테고리</p>
      </div>
      <div className="flex w-full flex-col gap-1">
        {categories.map((category) => {
          const isExpanded = expandedCategoryId === category.id;

          return (
            <div key={category.id} className="flex w-full flex-col">
              <button
                type="button"
                onClick={() => handleToggle(category.id)}
                className={cn(
                  'flex h-[50px] w-full items-center justify-between p-3.5',
                  isExpanded && 'border-t-2 border-primary-950',
                )}
              >
                <span
                  className={cn(
                    'text-primary-950',
                    isExpanded ? 'text-16-bold' : 'text-16-regular',
                  )}
                >
                  {category.name}
                </span>
                <Image
                  src={isExpanded ? chevronUpIcon : chevronDownIcon}
                  alt=""
                  width={16}
                  height={16}
                />
              </button>
              {isExpanded &&
                category.children.map((sub, index) => {
                  const isSelected = selectedCategoryId === sub.id;
                  const isLast = index === category.children.length - 1;

                  return (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => onSelect(sub.id)}
                      className={cn(
                        'flex h-[50px] w-full items-center px-[30px] py-2.5',
                        isLast && 'border-b border-primary-100',
                      )}
                    >
                      <span
                        className={cn(
                          isSelected
                            ? 'text-16-bold text-primary-950'
                            : 'text-16-regular text-primary-500',
                        )}
                      >
                        {sub.name}
                      </span>
                    </button>
                  );
                })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
