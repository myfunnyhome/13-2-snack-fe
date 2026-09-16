'use client';

import { type PropsWithChildren, useContext } from 'react';

import { cn } from '@/utils/cn';

import { DropdownContext } from './DropdownButton';

type DropdownItemProps = PropsWithChildren<{
  value: string;
  className?: string;
}>;

export default function DropdownItem({
  value,
  className,
  children,
}: DropdownItemProps) {
  const dropdown = useContext(DropdownContext);
  const isSelected: boolean = dropdown?.selectedValue === value;

  function handleClick(): void {
    dropdown?.selectOption(value);
  }

  return (
    <li role="option" aria-selected={isSelected}>
      <button
        type="button"
        onClick={handleClick}
        className={cn(
          'flex w-full items-center whitespace-nowrap px-4 py-3 text-left text-sm leading-5 text-primary-950 hover:bg-gray-50',
          className,
        )}
      >
        {children}
      </button>
    </li>
  );
}
