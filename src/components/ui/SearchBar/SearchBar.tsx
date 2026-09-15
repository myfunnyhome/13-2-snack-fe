import type { InputHTMLAttributes } from 'react';

import SearchIcon from '@/components/icons/SearchIcon';
import { cn } from '@/utils/cn';

type SearchBarSize = 'sm' | 'lg';

type SearchBarProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> & {
  size?: SearchBarSize;
  className?: string;
};

const SEARCH_BAR_SIZE_CLASS: Record<SearchBarSize, string> = {
  sm: 'w-[327px] py-3',
  lg: 'w-[696px] py-2',
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
        'flex items-center gap-3 border-b border-primary-900 text-primary-900',
        SEARCH_BAR_SIZE_CLASS[size],
        className,
      )}
    >
      <SearchIcon className="shrink-0" />
      <input
        type="search"
        placeholder={placeholder}
        className="text-16-regular min-w-0 flex-1 bg-transparent leading-none outline-none placeholder:text-primary-400"
        {...inputProps}
      />
    </label>
  );
}
