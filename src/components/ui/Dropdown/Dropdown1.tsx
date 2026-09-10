'use client';

import { useEffect, useRef, useState } from 'react';

import Image from 'next/image';

import chevronDownIcon from '@/assets/icons/chevron_down.svg';
import chevronUpIcon from '@/assets/icons/chevron_up.svg';
import { cn } from '@/utils/cn';

export type SortDropdown1Value = 'latest' | 'sales' | 'lowPrice' | 'highPrice';

export const SORT_DROPDOWN1_OPTIONS: ReadonlyArray<{
  label: string;
  value: SortDropdown1Value;
}> = [
  { label: '최신순', value: 'latest' },
  { label: '판매순', value: 'sales' },
  { label: '낮은 가격순', value: 'lowPrice' },
  { label: '높은 가격순', value: 'highPrice' },
];

type Dropdown1SortableItem = {
  createdAt: string;
  price: number;
  purchaseCount: number;
};

type Dropdown1Props<T extends Dropdown1SortableItem> = {
  className?: string;
  value?: SortDropdown1Value;
  items: readonly T[];
  onChange: (value: SortDropdown1Value, sortedItems: T[]) => void;
};

export default function Dropdown1<T extends Dropdown1SortableItem>({
  className,
  value,
  items,
  onChange,
}: Dropdown1Props<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    function handleOutsideClick(event: MouseEvent): void {
      if (!dropdownRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleEscapeKey(event: KeyboardEvent): void {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscapeKey);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen]);

  function selectOption(nextValue: SortDropdown1Value): void {
    const sortedItems = [...items];

    if (nextValue === 'latest') {
      sortedItems.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    } else if (nextValue === 'sales') {
      sortedItems.sort((a, b) => b.purchaseCount - a.purchaseCount);
    } else if (nextValue === 'lowPrice') {
      sortedItems.sort((a, b) => a.price - b.price);
    } else {
      sortedItems.sort((a, b) => b.price - a.price);
    }

    onChange(nextValue, sortedItems);
    setIsOpen(false);
  }

  return (
    <div
      ref={dropdownRef}
      className={cn('relative inline-block w-[110px] text-left', className)}
    >
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-label="상품 목록 정렬 기준"
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
          aria-label="상품 목록 정렬 옵션"
          className="absolute top-full right-0 z-10 -mt-px w-full border-x border-b border-primary-300 bg-white"
        >
          {SORT_DROPDOWN1_OPTIONS.map((option) => {
            const isSelected = value === option.value;

            return (
              <li key={option.value} role="option" aria-selected={isSelected}>
                <button
                  type="button"
                  onClick={() => selectOption(option.value)}
                  className={cn(
                    'flex h-[50px] w-full items-center whitespace-nowrap bg-white px-4 py-3 text-left text-sm leading-5 font-normal text-primary-950',
                  )}
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
