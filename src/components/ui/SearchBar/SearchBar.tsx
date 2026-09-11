import type { InputHTMLAttributes } from 'react';

import Image from 'next/image';

import searchIcon from '@/assets/icons/search.svg';
import { cn } from '@/utils/cn';

type SearchBarSize = 'sm' | 'lg';

type SearchBarProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> & {
  size?: SearchBarSize;
  className?: string;
};

const SEARCH_BAR_SIZE_CLASS: Record<SearchBarSize, string> = {
  sm: 'h-12 w-[327px] py-3',
  lg: 'h-10 w-[696px] px-5',
};

export default function SearchBar({
  size = 'sm',
  placeholder = '이름으로 검색하세요',
  className,
  ...inputProps
}: SearchBarProps) {
  return (
    <label
      className={cn(
        'flex items-center gap-3 border-b border-primary-900',
        SEARCH_BAR_SIZE_CLASS[size],
        className,
      )}
    >
      <Image
        src={searchIcon}
        alt=""
        width={24}
        height={24}
        aria-hidden
        className="shrink-0"
      />
      <input
        type="search"
        placeholder={placeholder}
        className="text-16-regular min-w-0 flex-1 bg-transparent outline-none placeholder:text-primary-400"
        {...inputProps}
      />
    </label>
  );
}
