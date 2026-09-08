"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import chevronDownIcon from "@/assets/icons/chevron_down.svg";
import chevronUpIcon from "@/assets/icons/chevron_up.svg";
import { cn } from "@/utils/cn";

export type SortDropdown1Value = "latest" | "sales" | "lowPrice" | "highPrice";

export type SortDropdown1SortableItem = {
  createdAt: string;
  price: number;
  purchaseCount: number;
};

export const SORT_DROPDOWN1_OPTIONS: ReadonlyArray<{
  label: string;
  value: SortDropdown1Value;
}> = [
  { label: "최신순", value: "latest" },
  { label: "판매순", value: "sales" },
  { label: "낮은 가격순", value: "lowPrice" },
  { label: "높은 가격순", value: "highPrice" },
];

type SortDropdown1Props<T extends SortDropdown1SortableItem> = {
  value: SortDropdown1Value;
  onChange: (value: SortDropdown1Value) => void;
  items?: readonly T[];
  onSortedItemsChange?: (items: T[]) => void;
};

export default function SortDropdown1<
  T extends SortDropdown1SortableItem = SortDropdown1SortableItem,
>({ value, onChange, items, onSortedItemsChange }: SortDropdown1Props<T>) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!items || !onSortedItemsChange) return;

    const sortedItems = [...items];

    if (value === "latest") {
      sortedItems.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    } else if (value === "sales") {
      sortedItems.sort((a, b) => b.purchaseCount - a.purchaseCount);
    } else if (value === "lowPrice") {
      sortedItems.sort((a, b) => a.price - b.price);
    } else {
      sortedItems.sort((a, b) => b.price - a.price);
    }

    onSortedItemsChange(sortedItems);
  }, [items, onSortedItemsChange, value]);

  function selectOption(nextValue: SortDropdown1Value) {
    onChange(nextValue);
    setIsOpen(false);
  }

  return (
    <div className="relative inline-block w-[110px] text-left">
      <button
        type="button"
        onClick={() => (isOpen ? setIsOpen(false) : setIsOpen(true))}
        aria-label="상품 목록 정렬 기준"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={cn(
          "flex h-11 w-full items-center justify-between border border-primary-300 bg-white px-4 py-3 text-sm leading-5 font-normal text-primary-950",
          isOpen && "border-b-transparent",
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
              <li
                key={option.value}
                role="option"
                aria-selected={isSelected}
              >
                <button
                  type="button"
                  onClick={() => selectOption(option.value)}
                  className={cn(
                    "flex h-[50px] w-full items-center whitespace-nowrap bg-white px-4 py-3 text-left text-sm leading-5 font-normal text-primary-950",
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
