export type DropdownItem = {
  id: string;
  name: string;
  price: number;
  purchaseCount: number;
  registeredAt: string;
};

export const DROPDOWN_DATA: DropdownItem[] = [
  {
    id: 'history-1',
    name: '새우깡',
    price: 1000,
    purchaseCount: 40,
    registeredAt: '2026-07-10',
  },
  {
    id: 'history-2',
    name: '포카칩',
    price: 2500,
    purchaseCount: 15,
    registeredAt: '2026-09-06',
  },
  {
    id: 'history-3',
    name: '꼬북칩',
    price: 1700,
    purchaseCount: 60,
    registeredAt: '2026-08-21',
  },
  {
    id: 'history-4',
    name: '홈런볼',
    price: 1300,
    purchaseCount: 5,
    registeredAt: '2026-09-03',
  },
];
