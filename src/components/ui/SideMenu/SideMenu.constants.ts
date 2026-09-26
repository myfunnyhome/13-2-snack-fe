export type SideMenuVisibility = 'always' | 'admin' | 'superAdmin' | 'wishlist';

export type SideMenuNavItem = {
  label: string;
  href: string;
  visibility: SideMenuVisibility;
  /** 하위 페이지까지 활성으로 볼 때 쓴다. 없으면 href를 기준으로 한다. */
  activePrefix?: string;
};

// src/app 라우트와 GNB 링크 주소를 따른다.
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
  { label: '찜목록', href: '/wishlist', visibility: 'wishlist' },
  { label: '마이페이지', href: '/profile', visibility: 'always' },
];

// 라벨 span이 부모의 hover를 따라가야 해서 group을 둔다.
export const ITEM_LAYOUT =
  'group flex h-[50px] w-full items-center justify-center gap-2 p-2';

// 항목 색상. 현재 페이지는 계속 진하고, 나머지는 hover에서 진해진다.
export const ITEM_COLOR = {
  active: 'text-primary-900',
  default: 'text-primary-700 hover:text-primary-900',
} as const;

// 라벨 타이포. 색상과 같은 cn() 호출에 넣으면 tailwind-merge가 지우므로 span에서 따로 준다.
export const ITEM_TEXT = {
  active: 'text-16-bold',
  default: 'text-16-regular group-hover:text-16-bold',
} as const;
