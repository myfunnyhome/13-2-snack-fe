'use client';

import { cn } from '@/utils/cn';

export type SubCategoryTab = {
  id: number;
  name: string;
};

type SubCategoryTabsProps = {
  categories: SubCategoryTab[];
  selectedId?: number | null;
  onSelect: (categoryId: number) => void;
  className?: string;
};

// 모바일 소분류 가로 탭. 상품 리스트·상세에서 쓴다.
export default function SubCategoryTabs({
  categories,
  selectedId,
  onSelect,
  className,
}: SubCategoryTabsProps) {
  return (
    <nav
      aria-label="소분류"
      className={cn('border-b border-primary-100', className)}
    >
      <ul className="flex gap-2 overflow-x-auto px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {categories.map(({ id, name }) => {
          const isActive = id === selectedId;

          return (
            <li key={id} className="shrink-0">
              <button
                type="button"
                onClick={() => onSelect(id)}
                aria-current={isActive ? 'true' : undefined}
                className={cn(
                  'flex h-[52px] items-center px-2 whitespace-nowrap',
                  isActive
                    ? 'text-14-bold text-primary-950'
                    : 'text-14-regular text-primary-400',
                )}
              >
                {name}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
