'use client';

import { useEffect, useState } from 'react';

import Image from 'next/image';

import chevronDownIcon from '@/assets/icons/chevron_down.svg';
import chevronUpIcon from '@/assets/icons/chevron_up.svg';
import { cn } from '@/utils/cn';

export type SortDropdown2Value = 'latest' | 'lowPrice' | 'highPrice';

export type SortDropdown2SortableItem = {
  registeredAt: string;
  price: number;
};

export const SORT_DROPDOWN2_OPTIONS: ReadonlyArray<{
  label: string;
  value: SortDropdown2Value;
}> = [
  { label: '최신순', value: 'latest' },
  { label: '낮은 가격순', value: 'lowPrice' },
  { label: '높은 가격순', value: 'highPrice' },
];

type SortDropdown2Props<T extends SortDropdown2SortableItem> = {
  value: SortDropdown2Value;
  onChange: (value: SortDropdown2Value) => void;
  items?: readonly T[];
  onSortedItemsChange?: (items: T[]) => void;
};

export default function SortDropdown2<
  T extends SortDropdown2SortableItem = SortDropdown2SortableItem,
>({ value, onChange, items, onSortedItemsChange }: SortDropdown2Props<T>) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!items || !onSortedItemsChange) return;

    const sortedItems = [...items];

    if (value === 'latest') {
      sortedItems.sort((a, b) => b.registeredAt.localeCompare(a.registeredAt));
    } else if (value === 'lowPrice') {
      sortedItems.sort((a, b) => a.price - b.price);
    } else {
      sortedItems.sort((a, b) => b.price - a.price);
    }

    onSortedItemsChange(sortedItems);
  }, [items, onSortedItemsChange, value]);

  function selectOption(nextValue: SortDropdown2Value) {
    onChange(nextValue);
    setIsOpen(false);
  }

  return (
    <div className="relative inline-block w-[110px] text-left">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-label="내역 목록 정렬 기준"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={cn(
          'flex h-11 w-full items-center justify-between border border-primary-300 bg-white px-4 py-3 text-sm leading-5 font-normal text-primary-950',
          isOpen && 'border-b-transparent',
        )}
      >
        <span>정렬</span>
        <Image
          src={isOpen ? chevronUpIcon : chevronDownIcon}
          alt=""
          width={16}
          height={16}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <ul
          role="listbox"
          aria-label="내역 목록 정렬 옵션"
          className="absolute top-full right-0 z-10 -mt-px w-full border-x border-b border-primary-300 bg-white"
        >
          {SORT_DROPDOWN2_OPTIONS.map((option) => {
            const isSelected = value === option.value;

            return (
              <li key={option.value} role="option" aria-selected={isSelected}>
                <button
                  type="button"
                  onClick={() => selectOption(option.value)}
                  className="flex h-[50px] w-full items-center whitespace-nowrap bg-white px-4 py-3 text-left text-sm leading-5 font-normal text-primary-950"
                >
                  {option.label}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
