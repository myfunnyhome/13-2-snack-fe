'use client';
import { useState } from 'react';

import { useMutation, useQuery } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import DropdownButton from '@/components/ui/Dropdown/DropdownButton';
import DropdownItem from '@/components/ui/Dropdown/DropdownItem';
import Pagination from '@/components/ui/List/Pagination';
import {
  PurchaseListItem,
  PurchaseListItemMobile,
} from '@/components/ui/Purchase/PurchaseListItem';
import { sortMenu } from '@/constants/dropdownMenu';
import { useScreenSize } from '@/hooks/common/useScreenSize';
import * as orderService from '@/lib/services/orderService';
import type { MyOrderSort } from '@/lib/services/orderService';

export default function MyPurchasesPage() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const [sort, setSort] = useState<MyOrderSort>('');
  const [page, setPage] = useState(1);
  const screenSize = useScreenSize();
  const limit = screenSize === 'desktop' ? 6 : screenSize === 'tablet' ? 8 : 3;

  const { data, isFetching } = useQuery({
    queryKey: ['myOrders', sort, page, limit],
    queryFn: () => orderService.getMyOrders({ sort, page, limit }),
    enabled: !!screenSize,
  });
  const mutation = useMutation({
    mutationFn: (id: number) => orderService.cancelMyOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['myOrders'],
      });
    },
  });

  if (isFetching) return <div>로딩 중...</div>;

  return (
    <div className="w-[80%] m-auto pb-[20px]">
      <div className="w-full flex justify-between items-center text-18-bold mb-[40px]">
        <h1>구매 요청 내역</h1>
        <DropdownButton
          value={sort}
          onChange={(value) => setSort(value as MyOrderSort)}
          placeholder="정렬"
          listClassName="border border-primary-100"
          containerClassName="border border-primary-100 text-16-regular"
          className="border-0"
        >
          {sortMenu.map(({ label, name }) => (
            <DropdownItem
              key={label}
              value={label}
              className="text-center justify-center text-16-regular"
            >
              {name}
            </DropdownItem>
          ))}
        </DropdownButton>
      </div>
      {screenSize !== 'mobile' && (
        <div className="w-full h-[60px] border-y border-primary-100 grid grid-cols-5 flex items-center text-16-bold text-primary-500">
          <p>구매 요청일</p>
          <p>상품 정보</p>
          <p>주문 금액</p>
          <p>상태</p>
          <p>비고</p>
        </div>
      )}
      {data?.items !== undefined &&
        (screenSize === 'mobile'
          ? data.items.map((item) => (
              <PurchaseListItemMobile
                key={item.id}
                date={item.createdAt}
                product={item.representativeProductName}
                price={item.totalPrice}
                status={item.status}
                onClick={() => router.push(`/purchases/${item.id}`)}
                onCancel={() => {
                  const willCancel = confirm('정말로 취소할 것인가요?');
                  if (willCancel) mutation.mutate(item.id);
                }}
              />
            ))
          : data.items.map((item) => (
              <PurchaseListItem
                key={item.id}
                date={item.createdAt}
                product={item.representativeProductName}
                price={item.totalPrice}
                status={item.status}
                onClick={() => router.push(`/purchases/${item.id}`)}
                onCancel={() => {
                  const willCancel = confirm('정말로 취소할 것인가요?');
                  if (willCancel) mutation.mutate(item.id);
                }}
              />
            )))}
      {data?.totalPages !== undefined && (
        <Pagination
          currentPage={page}
          totalPages={data.totalPages}
          onPageChange={setPage}
          className="mt-[30px]"
        />
      )}
    </div>
  );
}
