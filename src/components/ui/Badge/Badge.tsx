import Image from 'next/image';

import { cn } from '@/utils/cn';

import type { BadgeProps } from './Badge.types';

const badgeType = {
  status: 'w-[72px] h-[30px] p-0',
  authority:
    'w-[51px] h-[23px] p-0 text-[12px] md:w-[64px] md:h-[30px] md:text-[14px]',
};
const badgeStyles = {
  pending: 'bg-primary-100 text-primary-800',
  approved: 'bg-[#DEF3FF] text-[#00A2FF]',
  rejected: 'bg-[#FFDEDE] text-red',
  admin: 'bg-primary-700 text-white',
  general: 'bg-primary-50 text-primary-500',
  request: 'bg-secondary-100 text-secondary-500',
};

export default function Badge({
  type,
  variant = 'general',
  icon,
  message,
  className,
}: BadgeProps) {
  return (
    <div
      className={cn(
        'text-[14px] font-bold rounded-[100px] px-[7.5px] py-[6.5px] flex justify-center items-center gap-[1.5px]',
        type && badgeType[type],
        variant && badgeStyles[variant],
        className,
      )}
    >
      {icon && <Image src={icon} alt="배지 아이콘" width={14} height={14} />}
      <p className="whitespace-nowrap">{message}</p>
    </div>
  );
}
