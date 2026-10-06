import type { ReactNode } from 'react';

import { cn } from '@/utils/cn';

export type InfoItemProps = {
  label: string;
  value: ReactNode;
  fullWidth?: boolean;
  className?: string;
};

export function InfoItem({
  label,
  value,
  fullWidth = false,
  className,
}: InfoItemProps) {
  return (
    <div
      className={cn(
        'flex border-b border-primary-100',
        fullWidth && 'col-span-2',
        className,
      )}
    >
      <div
        className={cn(
          'border-r border-primary-100 px-[20px] py-[15px] text-16-regular text-primary-950',
          fullWidth ? 'w-1/4' : 'flex-1',
        )}
      >
        {label}
      </div>
      <div
        className={cn(
          'px-[20px] py-[15px] text-16-bold text-primary-900 leading-[160%]',
          fullWidth ? 'w-3/4' : 'flex-1',
        )}
      >
        {value}
      </div>
    </div>
  );
}
