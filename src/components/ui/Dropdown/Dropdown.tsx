'use client';

import { useEffect, useRef, useState } from 'react';

import Image from 'next/image';

import chevronDownIcon from '@/assets/icons/chevron_down.svg';
import chevronUpIcon from '@/assets/icons/chevron_up.svg';
import { cn } from '@/utils/cn';

export type DropdownOption<T extends string = string> = {
  label: string;
  value: T;
};

export type DropdownSortOption<
  TItem,
  TValue extends string = string,
> = DropdownOption<TValue> & {
  compare: (a: TItem, b: TItem) => number;
};

export type DropdownValue = 'latest' | 'sales' | 'lowPrice' | 'highPrice';

export type CategoryValue =
  | 'soft-drink'
  | 'fruit-drink'
  | 'energy-drink'
  | 'convenience-food'
  | 'fresh-food';

export const CATEGORY_OPTIONS: ReadonlyArray<DropdownOption<CategoryValue>> = [
  { label: '청량·탄산 음료', value: 'soft-drink' },
  { label: '과즙음료', value: 'fruit-drink' },
  { label: '에너지음료', value: 'energy-drink' },
  { label: '간편식', value: 'convenience-food' },
  { label: '신선식', value: 'fresh-food' },
];

export type DropdownSortableItem = {
  createdAt?: string;
  registeredAt?: string;
  price: number;
  purchaseCount?: number;
};

export function createProductDropdownOptions<
  T extends DropdownSortableItem,
>(): ReadonlyArray<DropdownSortOption<T, DropdownValue>> {
  return [
    {
      label: '최신순',
      value: 'latest',
      compare: (a, b) => {
        const aDate = a.createdAt ?? a.registeredAt ?? '';
        const bDate = b.createdAt ?? b.registeredAt ?? '';

        return bDate.localeCompare(aDate);
      },
    },
    {
      label: '판매순',
      value: 'sales',
      compare: (a, b) => (b.purchaseCount ?? 0) - (a.purchaseCount ?? 0),
    },
    {
      label: '낮은 가격순',
      value: 'lowPrice',
      compare: (a, b) => a.price - b.price,
    },
    {
      label: '높은 가격순',
      value: 'highPrice',
      compare: (a, b) => b.price - a.price,
    },
  ];
}

type DropdownProps<T extends string> = {
  className?: string;
  value?: T;
  options: ReadonlyArray<DropdownOption<T>>;
  onChange: (value: T) => void;
  placeholder?: string;
};

export default function Dropdown<T extends string>({
  className,
  value,
  options,
  onChange,
  placeholder = '정렬',
}: DropdownProps<T>) {
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

  function selectOption(nextValue: T): void {
    onChange(nextValue);
    setIsOpen(false);
  }

  const displayLabel =
    options.find((option) => option.value === value)?.label ?? placeholder;

  return (
    <div
      ref={dropdownRef}
      className={cn('relative inline-block w-[110px] text-left', className)}
    >
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-label="목록 옵션 선택"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={cn(
          'flex h-11 w-full items-center justify-between border border-primary-300 bg-white px-4 py-3 text-sm leading-5 font-normal text-primary-950',
          isOpen && 'border-b-transparent',
        )}
      >
        <span>{displayLabel}</span>
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
          aria-label="목록 선택 옵션"
          className="absolute top-full right-0 z-10 -mt-px w-full border-x border-b border-primary-300 bg-white"
        >
          {options.map((option) => {
            const isSelected = value === option.value;

            return (
              <li key={option.value} role="option" aria-selected={isSelected}>
                <button
                  type="button"
                  onClick={() => selectOption(option.value)}
                  className="flex h-[50px] w-full items-center whitespace-nowrap bg-white px-4 py-3 text-left text-sm leading-5 font-normal text-primary-950 hover:bg-gray-50"
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

export function sortDropdownItems<TItem, TValue extends string>(
  items: readonly TItem[],
  options: ReadonlyArray<DropdownSortOption<TItem, TValue>>,
  value?: TValue,
): TItem[] {
  const selectedOption = options.find((option) => option.value === value);

  if (!selectedOption) {
    return [...items];
  }

  return [...items].sort(selectedOption.compare);
}

type DropdownOptionProductProps<TItem, TValue extends string> = {
  className?: string;
  items: readonly TItem[];
  options: ReadonlyArray<DropdownSortOption<TItem, TValue>>;
  placeholder?: string;
  onChange?: (value: TValue, sortedItems: TItem[]) => void;
};

export function DropdownOptionProduct<TItem, TValue extends string>({
  className,
  items,
  options,
  placeholder = '정렬',
  onChange,
}: DropdownOptionProductProps<TItem, TValue>) {
  const [value, setValue] = useState<TValue>();

  function handleSortChange(nextValue: TValue): void {
    setValue(nextValue);
    onChange?.(nextValue, sortDropdownItems(items, options, nextValue));
  }

  return (
    <Dropdown
      className={cn('w-[120px]', className)}
      value={value}
      options={options}
      onChange={handleSortChange}
      placeholder={placeholder}
    />
  );
}

type DropdownOptionCategoryProps<T extends string> = {
  className?: string;
  options: ReadonlyArray<DropdownOption<T>>;
  placeholder?: string;
  onChange?: (value: T) => void;
};

export function DropdownOptionCategory<T extends string>({
  className,
  options,
  placeholder = '카테고리',
  onChange,
}: DropdownOptionCategoryProps<T>) {
  const [category, setCategory] = useState<T>();

  function handleCategoryChange(value: T): void {
    setCategory(value);
    onChange?.(value);
  }

  return (
    <Dropdown
      className={cn('w-[216px]', className)}
      value={category}
      options={options}
      onChange={handleCategoryChange}
      placeholder={placeholder}
    />
  );
}
