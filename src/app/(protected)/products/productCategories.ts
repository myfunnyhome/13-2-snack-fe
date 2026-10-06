import type { SubCategoryTab } from './SubCategoryTabs';

/*
@ 상품 카테고리
- 카테고리는 고정 목록이라 API로 받지 않고 상수로 둔다(2026-09-02 팀 결정).
- **id는 백엔드 시드(prisma/seedCatalog.ts)와 같아야 한다.** 상품의 categoryId가 이 id를 그대로 쓴다.
  둘이 어긋나면 목록이 0건이 되고 상품 등록이 실패하므로 임의로 바꾸지 않는다.
*/

export type Category = {
  id: number;
  name: string;
  children: SubCategoryTab[];
};

export const PRODUCT_CATEGORIES: Category[] = [
  {
    id: 1,
    name: '스낵',
    children: [
      { id: 101, name: '과자' },
      { id: 102, name: '쿠키' },
      { id: 103, name: '파이' },
      { id: 104, name: '초콜릿류' },
      { id: 105, name: '캔디류' },
      { id: 106, name: '껌류' },
      { id: 107, name: '비스켓류' },
      { id: 108, name: '씨리얼바' },
      { id: 109, name: '젤리류' },
      { id: 110, name: '견과류' },
      { id: 111, name: '워터젤리' },
    ],
  },
  {
    id: 2,
    name: '음료',
    children: [
      { id: 112, name: '청량/탄산음료' },
      { id: 113, name: '과즙음료' },
      { id: 114, name: '에너지음료' },
      { id: 115, name: '이온음료' },
      { id: 116, name: '유산균음료' },
      { id: 117, name: '건강음료' },
      { id: 118, name: '차류' },
      { id: 119, name: '두유/우유' },
      { id: 120, name: '커피' },
    ],
  },
  {
    id: 3,
    name: '생수',
    children: [
      { id: 121, name: '생수' },
      { id: 122, name: '스파클링' },
    ],
  },
  {
    id: 4,
    name: '간편식',
    children: [
      { id: 123, name: '봉지라면' },
      { id: 124, name: '과일' },
      { id: 125, name: '컵라면' },
      { id: 126, name: '핫도그 및 소시지' },
      { id: 127, name: '계란' },
      { id: 128, name: '죽/스프류' },
      { id: 129, name: '컵밥류' },
      { id: 130, name: '시리얼' },
      { id: 131, name: '반찬류' },
      { id: 132, name: '면류' },
      { id: 133, name: '요거트류' },
      { id: 134, name: '가공안주류' },
      { id: 135, name: '유제품' },
    ],
  },
  {
    id: 5,
    name: '신선식',
    children: [
      { id: 136, name: '샐러드' },
      { id: 137, name: '빵' },
      { id: 138, name: '햄버거/샌드위치' },
      { id: 139, name: '주먹밥/김밥' },
      { id: 140, name: '도시락' },
    ],
  },
  {
    id: 6,
    name: '원두커피',
    children: [
      { id: 141, name: '커피믹스' },
      { id: 145, name: '원두' },
      { id: 146, name: '캡슐커피' },
      { id: 147, name: '드립백' },
    ],
  },
  {
    id: 7,
    name: '비품',
    children: [
      { id: 142, name: '생활용품' },
      { id: 143, name: '일회용품' },
      { id: 144, name: '사무용품' },
    ],
  },
];

// 화면에 처음 보여줄 카테고리 (음료 > 청량/탄산음료)
export const DEFAULT_CATEGORY_ID = 112;

export type SelectedCategory = {
  parent: Category;
  child: SubCategoryTab | null;
};

// 소분류 id면 부모와 함께, 대분류 id면 부모만 돌려준다.
export function findCategory(categoryId: number): SelectedCategory | null {
  for (const parent of PRODUCT_CATEGORIES) {
    if (parent.id === categoryId) return { parent, child: null };

    const child = parent.children.find(({ id }) => id === categoryId);
    if (child) return { parent, child };
  }

  return null;
}
