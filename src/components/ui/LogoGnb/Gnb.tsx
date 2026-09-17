'use client';

import { useEffect, useRef, useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import cartIcon from '@/assets/icons/cart.svg';
import hamburgerMenuIcon from '@/assets/icons/hamburger_menu.svg';
import likeIcon from '@/assets/icons/like.svg';
import lockIcon from '@/assets/icons/lock.svg';
import userIcon from '@/assets/icons/user.svg';
import logo from '@/assets/images/logo.png';
import ChevronIcon from '@/components/icons/ChevronIcon';
import SubCategoryMenu from '@/components/ui/List/SubCategoryMenu';
import Profile from '@/components/ui/Profile/Profile';
import SideMenu from '@/components/ui/SideMenu/SideMenu';
import {
  NAV_ITEMS,
  type SideMenuNavItem,
} from '@/components/ui/SideMenu/SideMenu.constants';
import { signOut } from '@/lib/services/auth';
import { type Category, getCategories } from '@/lib/services/categoryService';
import { cn } from '@/utils/cn';

type GnbRole = 'GENERAL' | 'ADMIN' | 'SUPER_ADMIN';

type GnbProps = {
  variant?: 'guest' | 'login';
  userName?: string;
  cartCount?: number;
  role?: GnbRole;
  className?: string;
};

const NAV_LINK_CLASS =
  'text-16-bold inline-flex items-center px-2.5 py-3 text-primary-400 hover:text-primary-950';

function hasAdminMenu(role: GnbRole): boolean {
  return role === 'ADMIN' || role === 'SUPER_ADMIN';
}

function hasSuperAdminMenu(role: GnbRole): boolean {
  return role === 'SUPER_ADMIN';
}

function getDesktopNavItems(role: GnbRole): SideMenuNavItem[] {
  const showAdminMenu = hasAdminMenu(role);
  const showSuperAdminMenu = hasSuperAdminMenu(role);

  return NAV_ITEMS.filter((item) => {
    if (item.visibility === 'wishlist' || item.href === '/profile') {
      return false;
    }

    if (item.visibility === 'admin') {
      return showAdminMenu;
    }

    if (item.visibility === 'superAdmin') {
      return showSuperAdminMenu;
    }

    return true;
  });
}

function isActiveNavItem(pathname: string, item: SideMenuNavItem): boolean {
  const prefix = item.activePrefix ?? item.href;

  return pathname === item.href || pathname.startsWith(`${prefix}/`);
}

export default function Gnb({
  variant = 'login',
  userName,
  cartCount,
  role = 'GENERAL',
  className,
}: GnbProps) {
  const router = useRouter();
  const pathname = usePathname();
  const categoryMenuRef = useRef<HTMLDivElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState<boolean>(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null,
  );
  const isLoggedIn = variant === 'login';
  const showAdminMenu = hasAdminMenu(role);
  const showSuperAdminMenu = hasSuperAdminMenu(role);
  const desktopNavItems = getDesktopNavItems(role);
  const hasCategories = categories.length > 0;

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }

    let isMounted = true;

    async function loadCategories(): Promise<void> {
      try {
        const nextCategories = await getCategories();

        if (isMounted) {
          setCategories(nextCategories);
        }
      } catch {
        if (isMounted) {
          setCategories([]);
        }
      }
    }

    void loadCategories();

    return () => {
      isMounted = false;
    };
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isCategoryOpen) {
      return;
    }

    function handleOutsideClick(event: MouseEvent): void {
      if (!categoryMenuRef.current?.contains(event.target as Node)) {
        setIsCategoryOpen(false);
      }
    }

    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isCategoryOpen]);

  async function handleLogout(): Promise<void> {
    await signOut();
    setIsMenuOpen(false);
    setIsCategoryOpen(false);
    router.push('/login');
    router.refresh();
  }

  function handleOpenMenu(): void {
    setIsMenuOpen(true);
  }

  function handleCloseMenu(): void {
    setIsMenuOpen(false);
  }

  function handleToggleCategory(): void {
    if (!hasCategories) {
      return;
    }

    setIsCategoryOpen((prev) => !prev);
  }

  function handleSelectCategory(categoryId: number): void {
    setSelectedCategoryId(categoryId);
    setIsCategoryOpen(false);
    router.push(`/products?categoryId=${categoryId}`);
  }

  return (
    <>
      <header
        className={cn(
          'flex w-full items-center justify-between bg-white',
          'py-[16px] pr-[24px] pl-[10px]',
          'md:px-[24px] md:py-[28px]',
          'lg:px-[100px] lg:py-[32px]',
          className,
        )}
      >
        <div className="flex min-w-0 items-center gap-3 md:gap-6">
          <Link href="/" className="shrink-0">
            <Image
              src={logo}
              alt="Snack"
              width={103}
              height={44}
              className="h-6 w-auto md:h-11"
              priority
            />
          </Link>
          {isLoggedIn && (
            <div className="relative md:hidden" ref={categoryMenuRef}>
              <button
                type="button"
                className="text-16-bold flex items-center gap-1 py-3 text-primary-400"
                aria-label="카테고리"
                aria-expanded={isCategoryOpen}
                aria-haspopup="listbox"
                disabled={!hasCategories}
                onClick={handleToggleCategory}
              >
                카테고리
                <ChevronIcon
                  direction={isCategoryOpen ? 'up' : 'down'}
                  className="size-6"
                />
              </button>
              {isCategoryOpen && hasCategories ? (
                <SubCategoryMenu
                  categories={categories}
                  selectedCategoryId={selectedCategoryId}
                  onSelect={handleSelectCategory}
                  className="absolute top-full left-0 z-50 shadow-[0_4px_16px_rgba(0,0,0,0.08)]"
                />
              ) : null}
            </div>
          )}
          {isLoggedIn && (
            <nav
              className="hidden items-center gap-6 lg:flex"
              aria-label="주요"
            >
              {desktopNavItems.map((item) => {
                const isActive = isActiveNavItem(pathname, item);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={isActive ? 'page' : undefined}
                    className={NAV_LINK_CLASS}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-3 md:gap-4">
          {isLoggedIn ? (
            <>
              <Link
                href="/cart"
                className="relative inline-flex items-center justify-center p-1"
                aria-label={
                  cartCount && cartCount > 0
                    ? `장바구니 ${cartCount}개`
                    : '장바구니'
                }
              >
                <Image
                  src={cartIcon}
                  alt=""
                  width={24}
                  height={24}
                  aria-hidden
                />
                {cartCount != null && cartCount > 0 && (
                  <span className="text-12-bold text-primary-950 absolute inset-0 flex items-center justify-center pt-1">
                    {cartCount}
                  </span>
                )}
              </Link>
              <Link
                href="/wishlist"
                className="hidden md:inline-flex"
                aria-label="찜 목록"
              >
                <Image
                  src={likeIcon}
                  alt=""
                  width={24}
                  height={24}
                  aria-hidden
                />
              </Link>
              {userName ? (
                <Link
                  href="/profile"
                  className="hidden md:inline-flex"
                  aria-label="프로필"
                >
                  <Profile name={userName} size="sm" />
                </Link>
              ) : null}
              <button
                type="button"
                onClick={() => {
                  void handleLogout();
                }}
                className={cn(NAV_LINK_CLASS, 'hidden md:inline-flex')}
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className={cn(NAV_LINK_CLASS, 'gap-1')}>
                <Image
                  src={lockIcon}
                  alt=""
                  width={24}
                  height={24}
                  aria-hidden
                />
                로그인
              </Link>
              <Link href="/signup" className={cn(NAV_LINK_CLASS, 'gap-1')}>
                <Image
                  src={userIcon}
                  alt=""
                  width={24}
                  height={24}
                  aria-hidden
                />
                기업 담당자 회원가입
              </Link>
            </>
          )}
          {isLoggedIn && (
            <button
              type="button"
              className="inline-flex lg:hidden"
              aria-label="메뉴 열기"
              aria-expanded={isMenuOpen}
              onClick={handleOpenMenu}
            >
              <Image
                src={hamburgerMenuIcon}
                alt=""
                width={24}
                height={24}
                aria-hidden
              />
            </button>
          )}
        </div>
      </header>
      {isLoggedIn && (
        <SideMenu
          isOpen={isMenuOpen}
          onClose={handleCloseMenu}
          onLogout={() => {
            void handleLogout();
          }}
          showAdminMenu={showAdminMenu}
          showSuperAdminMenu={showSuperAdminMenu}
        />
      )}
    </>
  );
}
