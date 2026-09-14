'use client';

import { useEffect, useRef } from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import XIcon from '@/components/icons/XIcon';
import { cn } from '@/utils/cn';

import {
  FOCUSABLE_SELECTOR,
  ITEM_LAYOUT,
  NAV_ITEMS,
  type SideMenuNavItem,
} from './SideMenu.constants';

/*
@ 피그마 side menu variant
- size=tb: 225px 폭, padding 16px 24px, column, align-items flex-end, gap 20px
- 배경은 반투명 흰색 + backdrop blur 15px
- 항목은 177x50, padding 8px, 가운데 정렬, 항목 사이 간격 13px
- 활성 항목은 Gray/900, 나머지는 Gray/700
- Show 관리자 / Show 최고 관리자 / 찜목록 노출 여부를 프로퍼티로 제어한다.
- 메뉴 항목 목록은 SideMenu.constants.ts에서 관리한다.
*/

function isActivePath(pathname: string, item: SideMenuNavItem) {
  const prefix = item.activePrefix ?? item.href;

  return pathname === item.href || pathname.startsWith(`${prefix}/`);
}

type SideMenuProps = {
  isOpen: boolean;
  onClose: () => void;
  /** 피그마에 로그아웃이 항상 있으므로 필수로 받는다. */
  onLogout: () => void;
  /** 피그마 Show 관리자 */
  showAdminMenu?: boolean;
  /** 피그마 Show 최고 관리자 */
  showSuperAdminMenu?: boolean;
  /** 찜목록은 모든 권한에 노출한다. */
  showWishlist?: boolean;
  className?: string;
};

export default function SideMenu({
  isOpen,
  onClose,
  onLogout,
  showAdminMenu = false,
  showSuperAdminMenu = false,
  showWishlist = true,
  className,
}: SideMenuProps) {
  const pathname = usePathname();
  const panelRef = useRef<HTMLElement>(null);
  const previousPathnameRef = useRef(pathname);

  // 페이지가 바뀌면 메뉴를 닫는다.
  // 마운트 시점과 이미 닫혀 있을 때는 onClose를 부르지 않는다.
  useEffect(() => {
    if (previousPathnameRef.current === pathname) return;

    previousPathnameRef.current = pathname;
    if (isOpen) onClose();
  }, [pathname, isOpen, onClose]);

  // 열려 있는 동안 배경 스크롤을 막는다.
  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  // ESC로 닫고 Tab이 메뉴 밖으로 나가지 않게 가둔다.
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
        return;
      }

      if (event.key !== 'Tab' || !panelRef.current) return;

      const focusables =
        panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
        return;
      }

      if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // 열릴 때 메뉴 안으로 포커스를 옮기고, 닫힐 때 열기 버튼으로 되돌린다.
  // 되돌리지 않으면 포커스가 body로 빠져 키보드 사용자가 위치를 잃는다.
  useEffect(() => {
    if (!isOpen) return;

    const trigger = document.activeElement as HTMLElement | null;
    panelRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)?.focus();

    return () => {
      trigger?.focus();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const visibleItems = NAV_ITEMS.filter(({ visibility }) => {
    if (visibility === 'admin') return showAdminMenu;
    if (visibility === 'superAdmin') return showSuperAdminMenu;
    if (visibility === 'wishlist') return showWishlist;
    return true;
  });

  return (
    // 포커스를 가두고 배경 스크롤을 막으므로 모달로 알린다.
    <div
      role="dialog"
      aria-modal="true"
      aria-label="메뉴"
      className="fixed inset-0 z-50"
    >
      {/*
        메뉴 밖을 눌러도 닫히게 한다. 피그마에 딤 처리가 없어 배경은 투명하다.
        마우스 전용 보조 수단이라 보조기기에서는 감춘다.
        키보드는 ESC와 닫기 버튼으로 닫을 수 있다.
      */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 h-full w-full"
      />
      <nav
        ref={panelRef}
        aria-label="사이드 메뉴"
        className={cn(
          // 화면이 낮으면 항목이 잘리므로 메뉴 안에서 세로 스크롤되게 한다.
          'absolute top-0 right-0 flex h-full w-[225px] flex-col items-end gap-5 overflow-y-auto bg-white/80 px-6 py-4 backdrop-blur-[15px]',
          className,
        )}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="메뉴 닫기"
          className="text-primary-950 transition-colors hover:text-primary-700"
        >
          <XIcon />
        </button>

        <ul className="flex w-full flex-col gap-[13px]">
          {visibleItems.map((item) => {
            const { label, href } = item;
            const isActive = isActivePath(pathname, item);

            return (
              <li key={href}>
                {/*
                  타이포그래피 토큰과 텍스트 색상을 같은 cn() 호출에 넣으면
                  tailwind-merge가 둘 중 하나를 지우므로 색과 타이포를 나눠서 적용한다.
                */}
                <Link
                  href={href}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    ITEM_LAYOUT,
                    'transition-colors',
                    isActive ? 'text-primary-900' : 'text-primary-700',
                  )}
                >
                  <span
                    className={isActive ? 'text-16-bold' : 'text-16-regular'}
                  >
                    {label}
                  </span>
                </Link>
              </li>
            );
          })}

          <li>
            <button
              type="button"
              onClick={onLogout}
              className={cn(ITEM_LAYOUT, 'text-primary-700 transition-colors')}
            >
              <span className="text-16-regular">로그아웃</span>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}
