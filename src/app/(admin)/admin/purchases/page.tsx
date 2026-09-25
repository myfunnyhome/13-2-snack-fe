'use client';
import { useState } from 'react';

import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import DropdownButton from '@/components/ui/Dropdown/DropdownButton';
import DropdownItem from '@/components/ui/Dropdown/DropdownItem';
import Pagination from '@/components/ui/List/Pagination';
import {
  PurchaseListItem,
  PurchaseListItemMobile,
} from '@/components/ui/Purchase/PurchaseListItem';
import { sortMenu, statusMenu } from '@/constants/dropdownMenu';
import { useScreenSize } from '@/hooks/common/useScreenSize';
import * as adminOrderService from '@/lib/services/adminOrderService';

export default function MyOrganizationPurchasesManagement() {
  const router = useRouter();
  const [sort, setSort] = useState<adminOrderService.AdminOrderSort>('latest');
  const [status, setStatus] =
    useState<adminOrderService.AdminOrderStatus>('PENDING');
  const [page, setPage] = useState(1);
  const screenSize = useScreenSize();
  const limit = screenSize === 'desktop' ? 6 : screenSize === 'tablet' ? 8 : 3;

  const { data } = useQuery({
    queryKey: ['adminOrders', status, sort, page, limit],
    queryFn: () =>
      adminOrderService.getAdminOrders({
        status,
        sort,
        page,
        limit,
      }),
  });
  console.log(data);
  const { mutate: approveOrder, isPending: isApproving } = useMutation({
    mutationFn: ({
      orderId,
      responseMessage,
    }: {
      orderId: number;
      responseMessage: string;
    }) => adminOrderService.approveAdminOrder(orderId, { responseMessage }),
  });

  const { mutate: rejectOrder, isPending: isRejecting } = useMutation({
    mutationFn: ({
      orderId,
      responseMessage,
    }: {
      orderId: number;
      responseMessage: string;
    }) => adminOrderService.rejectAdminOrder(orderId, { responseMessage }),
  });

  return (
    <div className="p-[24px] lg:w-[1400px]">
      <div className="w-full flex justify-between items-center text-18-bold mb-[40px]">
        <h1>구매 요청 관리</h1>
        <div>
          <DropdownButton
            value={sort}
            onChange={(value) =>
              setSort(value as adminOrderService.AdminOrderSort)
            }
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
          <DropdownButton
            value={status}
            onChange={(value) =>
              setStatus(value as adminOrderService.AdminOrderStatus)
            }
            placeholder="정렬"
            listClassName="border border-primary-100"
            containerClassName="border border-primary-100 text-16-regular"
            className="border-0"
          >
            {statusMenu.map(({ label, name }) => (
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
      </div>
      {screenSize !== 'mobile' && (
        <div className="w-full h-[60px] border-y border-primary-100 grid grid-cols-5 flex items-center text-16-bold text-primary-500">
          <p>구매 요청일</p>
          <p>상품 정보</p>
          <p>주문 금액</p>
          <p>요청인</p>
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
                onClick={() => router.push(`/admin/purchases/${item.id}`)}
                onCancel={() => {
                  const willCancel = confirm('정말로 취소할 것인가요?');
                  if (willCancel)
                    rejectOrder({ orderId: item.id, responseMessage: '메롱' });
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
                onClick={() => router.push(`admin/purchases/${item.id}`)}
                onCancel={() => {
                  const willCancel = confirm('정말로 취소할 것인가요?');
                  if (willCancel)
                    rejectOrder({ orderId: item.id, responseMessage: '메롱' });
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
