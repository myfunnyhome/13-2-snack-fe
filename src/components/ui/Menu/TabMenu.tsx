'use client';

import { type ReactNode } from 'react';

import { cn } from '@/utils/cn';

export type TabMenuItem = {
  value: string;
  label: string;
  icon: ReactNode;
  activeIcon: ReactNode;
};

type TabMenuSize = 'sm' | 'lg';

type TabMenuProps = {
  items: TabMenuItem[];
  value: string;
  onChange: (value: string) => void;
  size?: TabMenuSize;
  className?: string;
};

/*
@ 피그마 tab menu variant
- sm: 높이 44px, 텍스트 14px (Body2/14)
- lg: 높이 50px, 텍스트 16px (Body1/16)
- 활성은 Bold, 비활성은 Regular
*/
const TAB_STYLES: Record<
  TabMenuSize,
  { height: string; active: string; inactive: string }
> = {
  sm: {
    height: 'h-11',
    active: 'text-14-bold',
    inactive: 'text-14-regular',
  },
  lg: {
    height: 'h-[50px]',
    active: 'text-16-bold',
    inactive: 'text-16-regular',
  },
};

export default function TabMenu({
  items,
  value,
  onChange,
  size = 'sm',
  className,
}: TabMenuProps) {
  return (
    <div role="tablist" className={cn('flex w-full items-start', className)}>
      {items.map((item) => {
        const isActive = item.value === value;

        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(item.value)}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 px-[18px] transition-colors',
              TAB_STYLES[size].height,
              isActive ? TAB_STYLES[size].active : TAB_STYLES[size].inactive,
              isActive
                ? 'border-b-2 border-primary-950 text-primary-950'
                : 'border-b border-primary-200 text-primary-500 hover:text-primary-950',
            )}
          >
            <span className="shrink-0" aria-hidden="true">
              {isActive ? item.activeIcon : item.icon}
            </span>
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
