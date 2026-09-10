'use client';

import { cn } from '@/utils/cn';

/*
@ 피그마 sub category item variant
- type=대분류: 138x50, padding 14px, space-between, 라벨 뒤에 chevron, 아래 2px 구분선
- type=소분류: 138x50, padding 10px 30px, gap 6px, chevron과 구분선 없음
- active=on: 대분류는 chevron이 위를 향하고, 소분류는 라벨 색이 진해진다.
- 폭은 상위 sub category menu를 따라가야 해서 138px 고정 대신 w-full로 둔다.
  (피그마의 138px은 메뉴 폭이 138px일 때의 값이다.)
*/

/*
@ 대분류(type=parent) 비활성화 — PR #47 리뷰 반영
- 대분류 행을 상위 sub category menu가 직접 그리는 방향으로 논의 중이라
  이 컴포넌트는 소분류 전용으로 두고 대분류 코드는 파일 하단에 주석으로 남긴다.
- sub category menu 작업이 끝나면 되살릴지 삭제할지 정한다.
- chevron은 @/components/icons/ChevronIcon 으로 옮겨 두었다.
*/

type SubCategoryItemProps = {
  label: string;
  /** 소분류 선택 여부 */
  active?: boolean;
  onClick?: () => void;
  className?: string;
};

export default function SubCategoryItem({
  label,
  active = false,
  onClick,
  className,
}: SubCategoryItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'true' : undefined}
      className={cn(
        'flex h-[50px] w-full shrink-0 items-center gap-1.5 px-[30px] py-[10px] transition-colors',
        active ? 'text-primary-950' : 'text-primary-500',
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
          active ? 'text-16-bold' : 'text-16-regular',
        )}
      >
        {label}
      </span>
    </button>
  );
}

/*
@ 대분류 복구용 원본 — sub category menu 담당자와 정리되면 되살리거나 지운다.
- 되살릴 때 import 추가: import ChevronIcon from '@/components/icons/ChevronIcon';

type SubCategoryItemType = 'parent' | 'child';

type SubCategoryItemProps = {
  label: string;
  // parent는 피그마 대분류, child는 소분류에 대응한다.
  type?: SubCategoryItemType;
  // 대분류는 펼침 여부, 소분류는 선택 여부를 뜻한다.
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
        'flex h-[50px] w-full shrink-0 items-center transition-colors',
        isParent
          ? 'justify-between border-b-2 border-primary-300 p-[14px] text-primary-950'
          : 'gap-1.5 px-[30px] py-[10px]',
        !isParent && (active ? 'text-primary-950' : 'text-primary-500'),
        className,
      )}
    >
      <span
        className={cn(
          'min-w-0 truncate',
          isParent || active ? 'text-16-bold' : 'text-16-regular',
        )}
      >
        {label}
      </span>
      {isParent ? <ChevronIcon direction={active ? 'up' : 'down'} /> : null}
    </button>
  );
}
*/
