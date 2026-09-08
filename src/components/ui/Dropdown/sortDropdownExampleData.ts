export type SortDropdown1Item = {
  id: string;
  name: string;
  price: number;
  purchaseCount: number;
  createdAt: string;
};

export type SortDropdown2Item = {
  id: string;
  name: string;
  price: number;
  registeredAt: string;
};

export const SORT_DROPDOWN1_DATA: SortDropdown1Item[] = [
  { id: "product-1", name: "콜라", price: 1500, purchaseCount: 40, createdAt: "2026-08-28" },
  { id: "product-2", name: "사이다", price: 1200, purchaseCount: 15, createdAt: "2026-09-05" },
  { id: "product-3", name: "환타", price: 1800, purchaseCount: 60, createdAt: "2026-08-17" },
  { id: "product-4", name: "포카리스웨트", price: 2000, purchaseCount: 5, createdAt: "2026-09-01" },
];

export const SORT_DROPDOWN2_DATA: SortDropdown2Item[] = [
  { id: "history-1", name: "새우깡", price: 1000, registeredAt: "2026-07-10" },
  { id: "history-2", name: "포카칩", price: 2500, registeredAt: "2026-09-06" },
  { id: "history-3", name: "꼬북칩", price: 1700, registeredAt: "2026-08-21" },
  { id: "history-4", name: "홈런볼", price: 1300, registeredAt: "2026-09-03" },
];
