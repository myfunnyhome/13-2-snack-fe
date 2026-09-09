'use client';

import { cn } from '@/utils/cn';

/*
@ 피그마 sub category item variant
- type=대분류: 138x50, padding 14px, space-between, 라벨 뒤에 chevron, 아래 2px 구분선
- type=소분류: 138x50, padding 10px 30px, gap 6px, chevron과 구분선 없음
- active=on: 대분류는 chevron이 위를 향하고, 소분류는 라벨 색이 진해진다.
*/

// src/assets/icons의 chevron svg는 fill이 black으로 고정되어 있어 토큰 색을 적용할 수 없다.
// fill만 currentColor로 바꿔 인라인으로 두고, 색은 부모의 text 색을 따르게 한다.
function ChevronIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="shrink-0"
    >
      <path
        d={
          isOpen
            ? 'M18.8936 13.917L12 7.02246L5.10547 13.917L6.16602 14.9775L11.999 9.14453L17.833 14.9775L18.8936 13.917Z'
            : 'M18.8933 9.34828L11.9997 16.2428L5.10517 9.34828L6.16572 8.28773L11.9987 14.1207L17.8327 8.28773L18.8933 9.34828Z'
        }
        fill="currentColor"
      />
    </svg>
  );
}

type SubCategoryItemType = 'parent' | 'child';

type SubCategoryItemProps = {
  label: string;
  /** parent는 피그마 대분류, child는 소분류에 대응한다. */
  type?: SubCategoryItemType;
  /** 대분류는 펼침 여부, 소분류는 선택 여부를 뜻한다. */
  active?: boolean;
  onClick?: () => void;
  className?: string;
};

export default function SubCategoryItem({
  label,
  type = 'child',
  active = false,
  onClick,
  className,
}: SubCategoryItemProps) {
  const isParent = type === 'parent';

  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={isParent ? active : undefined}
      aria-current={!isParent && active ? 'true' : undefined}
      className={cn(
        'flex h-[50px] w-[138px] shrink-0 items-center transition-colors',
        isParent
          ? 'justify-between border-b-2 border-primary-300 p-[14px] text-primary-950'
          : 'gap-1.5 px-[30px] py-[10px]',
        !isParent && (active ? 'text-primary-950' : 'text-primary-500'),
        className,
      )}
    >
      {/*
        타이포그래피 토큰과 텍스트 색상을 같은 cn() 호출에 넣으면
        tailwind-merge가 둘 중 하나를 지우므로 색은 위, 타이포는 아래로 분리한다.
      */}
      <span
        className={cn(
          'min-w-0 truncate',
          isParent || active ? 'text-16-bold' : 'text-16-regular',
        )}
      >
        {label}
      </span>
      {isParent ? <ChevronIcon isOpen={active} /> : null}
    </button>
  );
}
