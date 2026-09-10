'use client';

import { useState } from 'react';

import Dropdown1, {
  SORT_DROPDOWN1_OPTIONS,
  type SortDropdown1Value,
} from '@/components/ui/Dropdown/Dropdown1';
import Dropdown2, {
  SORT_DROPDOWN2_OPTIONS,
  type SortDropdown2Value,
} from '@/components/ui/Dropdown/Dropdown2';
import {
  SORT_DROPDOWN1_DATA,
  SORT_DROPDOWN2_DATA,
  type SortDropdown1Item,
  type SortDropdown2Item,
} from '@/components/ui/Dropdown/sortDropdownExampleData';

function formatDate(value: string) {
  return value.replaceAll('-', '. ');
}

export default function ExamplePage() {
  const [dropdown1, setDropdown1] = useState<{
    value?: SortDropdown1Value;
    items: SortDropdown1Item[];
  }>({ items: [...SORT_DROPDOWN1_DATA] });
  const [dropdown2, setDropdown2] = useState<{
    value?: SortDropdown2Value;
    items: SortDropdown2Item[];
  }>({ items: [...SORT_DROPDOWN2_DATA] });

  const selectedSort1 =
    SORT_DROPDOWN1_OPTIONS.find((option) => option.value === dropdown1.value)
      ?.label ?? '선택 전';
  const selectedSort2 =
    SORT_DROPDOWN2_OPTIONS.find((option) => option.value === dropdown2.value)
      ?.label ?? '선택 전';

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-12 bg-white px-4 py-10 sm:px-6">
      <header>
        <h1 className="text-2xl font-bold text-black">SortDropdown 테스트</h1>
        <p className="mt-2 text-sm text-primary-500">
          각 정렬 버튼은 아래의 전용 테스트 데이터에만 적용됩니다.
        </p>
      </header>

      <section aria-labelledby="sort-dropdown1-title">
        <div className="mb-4 flex items-end justify-between gap-4 border-b border-primary-200 pb-4">
          <div>
            <h2
              id="sort-dropdown1-title"
              className="text-lg font-semibold text-black"
            >
              Dropdown1
            </h2>
            <p className="mt-1 text-sm text-primary-500">
              상품 리스트용 · 현재 정렬: {selectedSort1}
            </p>
          </div>
          <Dropdown1
            value={dropdown1.value}
            items={dropdown1.items}
            onChange={(value, items) => setDropdown1({ value, items })}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-150 text-sm">
            <thead>
              <tr className="border-b border-primary-200 text-left text-primary-500">
                <th className="py-3 font-medium">순서</th>
                <th className="py-3 font-medium">상품명</th>
                <th className="py-3 font-medium">등록일</th>
                <th className="py-3 text-right font-medium">가격</th>
                <th className="py-3 text-right font-medium">판매량</th>
              </tr>
            </thead>
            <tbody>
              {dropdown1.items.map((item, index) => (
                <tr key={item.id} className="border-b border-primary-100">
                  <td className="py-4 text-primary-400">{index + 1}</td>
                  <td className="py-4 font-medium text-black">{item.name}</td>
                  <td className="py-4 text-primary-600">
                    {formatDate(item.createdAt)}
                  </td>
                  <td className="py-4 text-right text-primary-600">
                    {item.price.toLocaleString()}원
                  </td>
                  <td className="py-4 text-right text-primary-600">
                    {item.purchaseCount}회
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="sort-dropdown2-title">
        <div className="mb-4 flex items-end justify-between gap-4 border-b border-primary-200 pb-4">
          <div>
            <h2
              id="sort-dropdown2-title"
              className="text-lg font-semibold text-black"
            >
              Dropdown2
            </h2>
            <p className="mt-1 text-sm text-primary-500">
              그외:상품등록·구매 내역용 · 현재 정렬: {selectedSort2}
            </p>
          </div>
          <Dropdown2
            value={dropdown2.value}
            items={dropdown2.items}
            onChange={(value, items) => setDropdown2({ value, items })}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-125 text-sm">
            <thead>
              <tr className="border-b border-primary-200 text-left text-primary-500">
                <th className="py-3 font-medium">순서</th>
                <th className="py-3 font-medium">상품명</th>
                <th className="py-3 font-medium">등록일</th>
                <th className="py-3 text-right font-medium">가격</th>
              </tr>
            </thead>
            <tbody>
              {dropdown2.items.map((item, index) => (
                <tr key={item.id} className="border-b border-primary-100">
                  <td className="py-4 text-primary-400">{index + 1}</td>
                  <td className="py-4 font-medium text-black">{item.name}</td>
                  <td className="py-4 text-primary-600">
                    {formatDate(item.registeredAt)}
                  </td>
                  <td className="py-4 text-right text-primary-600">
                    {item.price.toLocaleString()}원
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
