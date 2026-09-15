'use client';

import {
  Children,
  type PropsWithChildren,
  type ReactNode,
  createContext,
  isValidElement,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';

import Image from 'next/image';

import chevronDownIcon from '@/assets/icons/chevron_down.svg';
import chevronUpIcon from '@/assets/icons/chevron_up.svg';
import { cn } from '@/utils/cn';

type DropdownContextValue = {
  selectedValue?: string;
  selectOption: (value: string) => void;
};

export const DropdownContext = createContext<DropdownContextValue | null>(null);

type DropdownButtonProps = PropsWithChildren<{
  className?: string;
  listClassName?: string;
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
}>;

function getSelectedLabel(
  children: ReactNode,
  value: string | undefined,
  placeholder: string,
): string {
  let selectedLabel: string | undefined;

  Children.forEach(children, (child) => {
    if (!isValidElement<{ value: string; children?: ReactNode }>(child)) {
      return;
    }

    if (
      child.props.value !== value ||
      typeof child.props.children !== 'string'
    ) {
      return;
    }

    selectedLabel = child.props.children;
  });

  return selectedLabel ?? placeholder;
}

export default function DropdownButton({
  className,
  listClassName,
  value,
  onChange,
  placeholder = '선택',
  children,
}: DropdownButtonProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();
  const displayLabel = getSelectedLabel(children, value, placeholder);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

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

  function selectOption(nextValue: string): void {
    onChange(nextValue);
    setIsOpen(false);
  }

  return (
    <DropdownContext.Provider value={{ selectedValue: value, selectOption }}>
      <div ref={dropdownRef} className="relative inline-block">
        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={isOpen ? listboxId : undefined}
          className={cn(
            'flex w-full items-center justify-between gap-2 border border-primary-300 bg-white px-4 py-3 text-sm leading-5 text-primary-950',
            isOpen && 'border-b-transparent',
            className,
          )}
        >
          <span>{displayLabel}</span>
          <Image
            src={isOpen ? chevronUpIcon : chevronDownIcon}
            alt=""
            width={16}
            height={16}
            aria-hidden
          />
        </button>

        {isOpen ? (
          <ul
            id={listboxId}
            role="listbox"
            className={cn(
              'absolute top-full left-0 z-10 -mt-px w-full border-x border-b border-primary-300 bg-white',
              listClassName,
            )}
          >
            {children}
          </ul>
        ) : null}
      </div>
    </DropdownContext.Provider>
  );
}
