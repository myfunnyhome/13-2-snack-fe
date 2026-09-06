// 나중에 장바구니 개수를 받으면 <Gnb cartCount={개수} /> 로 넘기면 됩니다.
import Image from 'next/image';

import cartIcon from '@/assets/icons/cart.svg';
import chevronDownIcon from '@/assets/icons/chevron_down.svg';
import hamburgerMenuIcon from '@/assets/icons/hamburger_menu.svg';
import likeIcon from '@/assets/icons/like.svg';
import lockIcon from '@/assets/icons/lock.svg';
import userIcon from '@/assets/icons/user.svg';
import logo from '@/assets/images/logo.png';
import Profile from '@/components/ui/Profile/Profile';
import { cn } from '@/utils/cn';

const PLACEHOLDER_HREF = '@';

const NAV_ITEMS = [
  { label: '상품 리스트', href: PLACEHOLDER_HREF },
  { label: '구매 요청 내역', href: PLACEHOLDER_HREF },
  { label: '상품 등록 내역', href: PLACEHOLDER_HREF },
  { label: '구매 요청 관리', href: PLACEHOLDER_HREF },
  { label: '구매 내역 확인', href: PLACEHOLDER_HREF },
  { label: '관리', href: PLACEHOLDER_HREF },
];

interface GnbProps {
  variant?: 'guest' | 'login';
  userName?: string;
  cartCount?: number;
  className?: string;
}

export default function Gnb({
  variant = 'login',
  userName = '김',
  cartCount,
  className,
}: GnbProps) {
  const isLoggedIn = variant === 'login';

  return (
    <header
      className={cn(
        'fixed top-0 right-0 left-0 z-50 flex w-full items-center justify-between bg-white',
        'h-[56px] py-[16px] pr-[24px] pl-[10px]',
        'md:h-[100px] md:px-[24px] md:py-[28px]',
        'lg:h-[90px] lg:px-[100px] lg:py-[32px]',
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-3 md:gap-6">
        <a href={PLACEHOLDER_HREF} className="shrink-0">
          <Image
            src={logo}
            alt="Snack"
            width={103}
            height={44}
            className="h-6 w-auto md:h-11"
            priority
          />
        </a>
        {isLoggedIn && (
          <button
            type="button"
            className="text-16-bold flex items-center gap-1 text-primary-400 hover:text-primary-950 md:hidden"
            aria-label="음료 카테고리 선택"
          >
            음료
            <Image
              src={chevronDownIcon}
              alt=""
              width={24}
              height={24}
              aria-hidden
            />
          </button>
        )}
        {isLoggedIn && (
          <nav className="hidden items-center gap-6 lg:flex" aria-label="주요">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-16-bold inline-flex h-10 items-center px-2.5 text-primary-400 hover:text-primary-950"
              >
                {item.label}
              </a>
            ))}
          </nav>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-3 md:gap-4">
        {isLoggedIn ? (
          <>
            <a
              href={PLACEHOLDER_HREF}
              className="relative inline-flex h-6 w-6 items-center justify-center"
              aria-label={
                cartCount && cartCount > 0
                  ? `장바구니 ${cartCount}개`
                  : '장바구니'
              }
            >
              <Image src={cartIcon} alt="" width={24} height={24} aria-hidden />
              {cartCount != null && cartCount > 0 && (
                <span className="text-12-bold text-primary-950 absolute inset-0 flex items-center justify-center pt-1">
                  {cartCount}
                </span>
              )}
            </a>
            <a
              href={PLACEHOLDER_HREF}
              className="hidden md:inline-flex"
              aria-label="찜 목록"
            >
              <Image src={likeIcon} alt="" width={24} height={24} aria-hidden />
            </a>
            <a
              href={PLACEHOLDER_HREF}
              className="hidden md:inline-flex"
              aria-label="프로필"
            >
              <Profile name={userName} size="sm" />
            </a>
            <button
              type="button"
              className="text-16-bold hidden h-10 items-center px-2.5 text-primary-400 hover:text-primary-950 md:inline-flex"
            >
              로그아웃
            </button>
          </>
        ) : (
          <>
            <a
              href={PLACEHOLDER_HREF}
              className="text-16-bold inline-flex h-10 items-center gap-1 px-2.5 text-primary-400 hover:text-primary-950"
            >
              <Image src={lockIcon} alt="" width={24} height={24} aria-hidden />
              로그인
            </a>
            <a
              href={PLACEHOLDER_HREF}
              className="text-16-bold hidden h-10 items-center gap-1 px-2.5 text-primary-400 hover:text-primary-950 md:inline-flex"
            >
              <Image src={userIcon} alt="" width={24} height={24} aria-hidden />
              기업 담당자 회원가입
            </a>
          </>
        )}
        <button
          type="button"
          className="inline-flex lg:hidden"
          aria-label="메뉴 열기"
        >
          <Image
            src={hamburgerMenuIcon}
            alt=""
            width={24}
            height={24}
            aria-hidden
          />
        </button>
      </div>
    </header>
  );
}
