export type SideMenuVisibility = 'always' | 'admin' | 'superAdmin' | 'wishlist';

export type SideMenuNavItem = {
  label: string;
  href: string;
  visibility: SideMenuVisibility;
  /** 하위 페이지까지 활성으로 볼 때 쓴다. 없으면 href를 기준으로 한다. */
  activePrefix?: string;
};

// src/app에 만들어진 라우트를 그대로 사용한다.
// 관리는 최고 관리자 페이지의 첫 번째 탭인 회원 관리로 들어간다.
export const NAV_ITEMS: SideMenuNavItem[] = [
  { label: '상품 리스트', href: '/products', visibility: 'always' },
  { label: '구매 요청 내역', href: '/purchases', visibility: 'always' },
  { label: '상품 등록 내역', href: '/my-products', visibility: 'always' },
  {
    label: '구매 요청 관리',
    href: '/admin/purchase-requests',
    visibility: 'admin',
  },
  { label: '구매 내역 확인', href: '/admin/purchases', visibility: 'admin' },
  {
    label: '관리',
    href: '/super-admin/members',
    visibility: 'superAdmin',
    activePrefix: '/super-admin',
  },
  { label: '찜목록', href: '/cart', visibility: 'wishlist' },
  { label: '마이페이지', href: '/profile', visibility: 'always' },
];

export const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled])';

export const ITEM_LAYOUT =
  'flex h-[50px] w-full items-center justify-center gap-2 p-2';
