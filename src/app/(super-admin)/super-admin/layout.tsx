'use client';

import type { PropsWithChildren } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import coinIcon from '@/assets/icons/coin.svg';
import coinActiveIcon from '@/assets/icons/coin_active.svg';
import userIcon from '@/assets/icons/user.svg';
import userActiveIcon from '@/assets/icons/user_active.svg';
import { cn } from '@/utils/cn';

type SuperAdminNavItem = {
  label: string;
  href: string;
  icon: typeof userIcon;
  activeIcon: typeof userActiveIcon;
};

const NAV_ITEMS: SuperAdminNavItem[] = [
  {
    label: '회원 관리',
    href: '/super-admin/members',
    icon: userIcon,
    activeIcon: userActiveIcon,
  },
  {
    label: '예산 관리',
    href: '/super-admin/budget',
    icon: coinIcon,
    activeIcon: coinActiveIcon,
  },
];

export default function Layout({ children }: PropsWithChildren) {
  const pathname = usePathname();

  return (
    <div className="flex w-full gap-10 px-6 py-10 md:px-10 lg:gap-16 lg:px-[100px] lg:py-14">
      <nav
        aria-label="관리 메뉴"
        className="hidden w-[180px] shrink-0 flex-col gap-1 lg:flex"
      >
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex h-[50px] w-full items-center gap-2 px-[18px] transition-colors',
                isActive
                  ? 'text-16-bold bg-primary-50 text-primary-950'
                  : 'text-16-regular text-primary-500 hover:bg-primary-50 hover:text-primary-950',
              )}
            >
              <Image
                src={isActive ? item.activeIcon : item.icon}
                alt=""
                width={20}
                height={20}
                aria-hidden
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
