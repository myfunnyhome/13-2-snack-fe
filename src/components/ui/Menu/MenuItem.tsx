'use client';

import { type ReactNode } from 'react';

import { cn } from '@/utils/cn';

type MenuItemProps = {
  label: string;
  icon?: ReactNode;
  onClick?: () => void;
  className?: string;
};

export default function MenuItem({
  label,
  icon,
  onClick,
  className,
}: MenuItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        // 피그마 menu variant
        // default: 배경 없음 + Body1/16 R + primary-500
        // active(hover·focus): primary-50 배경 + Body1/16 B + primary-950
        'text-16-regular flex h-[50px] w-full items-center gap-2 px-[18px] text-left text-primary-500 transition-colors',
        'hover:text-16-bold hover:bg-primary-50 hover:text-primary-950',
        'focus-visible:text-16-bold focus-visible:bg-primary-50 focus-visible:text-primary-950 focus-visible:outline-none',
        className,
      )}
    >
      {icon ? (
        <span className="shrink-0" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <span className="truncate">{label}</span>
    </button>
  );
}
