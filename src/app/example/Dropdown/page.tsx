'use client';

import { useState } from 'react';

import Dropdown, {
  DROPDOWN_OPTIONS,
  type DropdownValue,
} from '@/components/ui/Dropdown/Dropdown';
import {
  DROPDOWN_DATA,
  type DropdownItem,
} from '@/components/ui/Dropdown/DropdownExampleData';

function formatDate(value: string) {
  return value.replaceAll('-', '. ');
}

export default function ExamplePage() {
  const [sort, setSort] = useState<{
    value?: DropdownValue;
    items: DropdownItem[];
  }>({ items: [...DROPDOWN_DATA] });

  const selectedSort =
    DROPDOWN_OPTIONS.find((option) => option.value === sort.value)?.label ??
    '선택 전';

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-12 bg-white px-4 py-10 sm:px-6">
      <header>
        <h1 className="text-2xl font-bold text-black">Dropdown 테스트</h1>
      </header>

      <section aria-labelledby="dropdown-title">
        <div className="mb-4 flex items-end justify-between gap-4 border-b border-primary-200 pb-4">
          <div>
            <h2
              id="dropdown-title"
              className="text-lg font-semibold text-black"
            >
              Dropdown
            </h2>
            <p className="mt-1 text-sm text-primary-500">
              상품등록·구매 내역용 · 현재 정렬: {selectedSort}
            </p>
          </div>
          <Dropdown
            value={sort.value}
            items={DROPDOWN_DATA}
            onChange={(value, sortedItems) =>
              setSort({ value, items: sortedItems })
            }
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-125 text-sm">
            <thead>
              <tr className="border-b border-primary-200 text-left text-primary-500">
                <th className="py-3 font-medium">순서</th>
                <th className="py-3 font-medium">상품명</th>
                <th className="py-3 font-medium">등록일</th>
                <th className="py-3 text-right font-medium">판매량</th>
                <th className="py-3 text-right font-medium">가격</th>
              </tr>
            </thead>
            <tbody>
              {sort.items.map((item, index) => (
                <tr key={item.id} className="border-b border-primary-100">
                  <td className="py-4 text-primary-400">{index + 1}</td>
                  <td className="py-4 font-medium text-black">{item.name}</td>
                  <td className="py-4 text-primary-600">
                    {formatDate(item.registeredAt)}
                  </td>
                  <td className="py-4 text-right text-primary-600">
                    {item.purchaseCount.toLocaleString()}개
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
