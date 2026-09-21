import type { SubCategoryTab } from './SubCategoryTabs';

/*
@ 상품 카테고리 임시 데이터
- 리스트와 상세가 같은 목록을 써야 해서 한 곳에 모았다.
- TODO: 카테고리 API가 생기면 이 파일만 교체한다.
*/

export type Category = {
  id: number;
  name: string;
  children: SubCategoryTab[];
};

export const MOCK_CATEGORIES: Category[] = [
  { id: 1, name: '스낵', children: [] },
  {
    id: 2,
    name: '음료',
    children: [
      { id: 21, name: '청량 ∙ 탄산 음료' },
      { id: 22, name: '과즙음료' },
      { id: 23, name: '에너지음료' },
      { id: 24, name: '이온음료' },
      { id: 25, name: '건강음료' },
    ],
  },
  { id: 3, name: '생수', children: [] },
  { id: 4, name: '간편식', children: [] },
  { id: 5, name: '신선식', children: [] },
  { id: 6, name: '원두커피', children: [] },
  { id: 7, name: '비품', children: [] },
];

export const DEFAULT_CATEGORY_ID = 21;

export type SelectedCategory = {
  parent: Category;
  child: SubCategoryTab | null;
};

// 소분류 id면 부모와 함께, 대분류 id면 부모만 돌려준다.
export function findCategory(categoryId: number): SelectedCategory | null {
  for (const parent of MOCK_CATEGORIES) {
    if (parent.id === categoryId) return { parent, child: null };

    const child = parent.children.find(({ id }) => id === categoryId);
    if (child) return { parent, child };
  }

  return null;
}
