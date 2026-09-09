// 사용법:
// <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} size="lg" />
// size: 'sm'(MO) / 'lg'(PC·TB, 기본) / currentPage: 1부터 시작 / totalPages: 전체 페이지 수
// 1페이지에서 Prev, 마지막 페이지에서 Next 자동 비활성화
'use client';

import Image from 'next/image';

import chevronRightIcon from '@/assets/icons/chevron__right.svg';
import chevronLeftIcon from '@/assets/icons/chevron_left.svg';
import { cn } from '@/utils/cn';

type PaginationSize = 'sm' | 'lg';

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  size?: PaginationSize;
  className?: string;
};

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  size = 'lg',
  className,
}: PaginationProps) {
  const isPrevDisabled = currentPage <= 1;
  const isNextDisabled = currentPage >= totalPages;

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    onPageChange(page);
  };

  return (
    <nav
      aria-label="페이지 탐색"
      className={cn('flex w-full items-center justify-between', className)}
    >
      <p
        className={cn(
          'text-primary-950',
          size === 'sm' ? 'text-16-regular' : 'text-18-regular',
        )}
      >
        {currentPage} of {totalPages}
      </p>
      <div className="flex items-center gap-[30px]">
        <button
          type="button"
          aria-label="이전 페이지"
          disabled={isPrevDisabled}
          onClick={() => handlePageChange(currentPage - 1)}
          className="flex items-center gap-1.5 disabled:cursor-not-allowed"
        >
          <Image src={chevronLeftIcon} alt="" width={24} height={24} />
          <span
            className={cn(
              isPrevDisabled ? 'text-primary-500' : 'text-primary-950',
              size === 'sm' ? 'text-16-regular' : 'text-18-regular',
            )}
          >
            Prev
          </span>
        </button>
        <button
          type="button"
          aria-label="다음 페이지"
          disabled={isNextDisabled}
          onClick={() => handlePageChange(currentPage + 1)}
          className="flex items-center gap-[5px] disabled:cursor-not-allowed"
        >
          <span
            className={cn(
              isNextDisabled ? 'text-primary-500' : 'text-primary-950',
              size === 'sm' ? 'text-16-regular' : 'text-18-regular',
            )}
          >
            Next
          </span>
          <Image src={chevronRightIcon} alt="" width={24} height={24} />
        </button>
      </div>
    </nav>
  );
}
