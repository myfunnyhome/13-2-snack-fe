import Image from 'next/image';

import { cn } from '@/utils/cn';

import type { BadgeProps } from './Badge.types';

const badgeType = {
  STATUS: 'w-[80px] h-[30px] p-0',
  AUTHORITY:
    'w-[51px] h-[23px] p-0 text-[12px] md:w-[64px] md:h-[30px] md:text-[14px]',
};
const badgeStyles = {
  PENDING: 'bg-primary-100 text-primary-800',
  APPROVED: 'bg-[#DEF3FF] text-[#00A2FF]',
  REJECTED: 'bg-[#FFDEDE] text-red',
  CANCELED: 'bg-primary-400 text-primary-950',
  ADMIN: 'bg-primary-700 text-white',
  GENERAL: 'bg-primary-50 text-primary-500',
  REQUEST: 'bg-secondary-100 text-secondary-500',
};

export default function Badge({
  type,
  variant = 'GENERAL',
  icon,
  message,
  className,
}: BadgeProps) {
  return (
    <div
      className={cn(
        'text-14-bold rounded-[100px] px-[7.5px] py-[6.5px] flex justify-center items-center gap-[4px]',
        type && badgeType[type],
        variant && badgeStyles[variant],
        className,
      )}
    >
      {icon &&
        ('src' in icon ? (
          <Image src={icon} alt="배지 아이콘" width={14} height={14} />
        ) : (
          icon
        ))}
      <p className="whitespace-nowrap">{message}</p>
    </div>
  );
}
