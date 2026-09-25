'use client';
import { useState } from 'react';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import SubtractIcon from '@/assets/icons/subtract.svg';
import { ExclamationIcon } from '@/components/icons';
import Button from '@/components/ui/Button/Button';
import DropdownButton from '@/components/ui/Dropdown/DropdownButton';
import DropdownItem from '@/components/ui/Dropdown/DropdownItem';
import Pagination from '@/components/ui/List/Pagination';
import { AlertModal } from '@/components/ui/Modal';
import {
  PurchaseManagementListItem,
  PurchaseManagementListItemMobile,
} from '@/components/ui/Purchase/PurchaseListItem';
import { sortMenu, statusMenu } from '@/constants/dropdownMenu';
import { useScreenSize } from '@/hooks/common/useScreenSize';
import * as adminOrderService from '@/lib/services/adminOrderService';
import { useModal } from '@/providers/ModalProvider';
import { useToast } from '@/providers/ToastProvider';

type RemarkButtonsProps = {
  pending?: boolean;
  rejectOrder: () => void;
  approveOrder: () => void;
};
function RemarkButtons({
  pending = false,
  rejectOrder,
  approveOrder,
}: RemarkButtonsProps) {
  const { openModal, closeModal } = useModal();
  return (
    <div
      onClick={(event) => event.stopPropagation()}
      className="flex gap-[8px]"
    >
      <Button
        text="반려"
        type="button"
        variant="secondary"
        size="sm"
        onClick={() => {
          openModal(
            <AlertModal
              title="구매 요청을 반려하시겠어요?"
              descriptions={['반려하기 전 한번 더 확인해주십시오.']}
              secondaryAction={{
                text: '취소',
                onClick: () => {
                  closeModal();
                },
              }}
              primaryAction={{
                text: '반려',
                onClick: () => {
                  rejectOrder();
                },
              }}
            />,
          );
        }}
      />
      <Button
        text="승인"
        type="button"
        variant="primary"
        size="sm"
        disabled={!pending}
        onClick={() => {}}
      />
    </div>
  );
}

export default function MyOrganizationPurchasesManagement() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { open } = useToast('top');
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
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['adminOrders'],
      });
    },
    onError: () => {
      open({
        text: '예산이 부족합니다. 수량을 줄이거나 항목을 제거해주세요.',
        secondaryText: `남은 예산: ${1000}원`,
        icon: <ExclamationIcon fill="var(--error-red)" />,
      });
    },
  });
  const { mutate: rejectOrder, isPending: isRejecting } = useMutation({
    mutationFn: ({
      orderId,
      responseMessage,
    }: {
      orderId: number;
      responseMessage: string;
    }) => adminOrderService.rejectAdminOrder(orderId, { responseMessage }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['adminOrders'],
      });
    },
  });

  const PurchaseHeader = (
    <div className="w-full flex justify-between items-center text-18-bold mb-[40px]">
      <h1>구매 요청 관리</h1>

      <div className="flex flex-col justify-end md:flex-row">
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
  );

  if (data?.items.length === 0) {
    return (
      <div className="flex flex-col items-center px-[24px] py-[30px] lg:w-[1400px]">
        {PurchaseHeader}
        <div className="w-[310px] flex flex-col items-center">
          <div className="w-[100px] h-[100px] mb-[30px] rounded-[100%] flex justify-center items-center bg-primary-25">
            <Image src={SubtractIcon} alt="상품 리스트 없음 아이콘" />
          </div>
          <h1 className="text-24-bold mb-[10px]">요청 내역이 없어요</h1>
          <p className="text-16-regular leading-[160%] mb-[50px]">
            상품 리스트를 둘러보고
            <br /> 상품을 담아보세요
          </p>
          <Button
            text="상품 리스트로 이동"
            type="button"
            variant="primary"
            onClick={() => {
              router.push('/products');
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="p-[24px] lg:w-[1400px]">
      {PurchaseHeader}
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
              <PurchaseManagementListItemMobile
                key={item.id}
                date={item.createdAt}
                product={item.representativeProductName}
                price={item.totalPrice}
                profile={item.requester.name}
                remarks={
                  <RemarkButtons
                    pending={item.status === 'PENDING'}
                    rejectOrder={() =>
                      rejectOrder({
                        orderId: item.id,
                        responseMessage: '',
                      })
                    }
                    approveOrder={() =>
                      approveOrder({
                        orderId: item.id,
                        responseMessage: '',
                      })
                    }
                  />
                }
                onClick={() => router.push(`/admin/purchases/${item.id}`)}
              />
            ))
          : data.items.map((item) => (
              <PurchaseManagementListItem
                key={item.id}
                date={item.createdAt}
                product={item.representativeProductName}
                price={item.totalPrice}
                profile={item.requester.name}
                remarks={
                  <RemarkButtons
                    pending={item.status === 'PENDING'}
                    rejectOrder={() =>
                      rejectOrder({
                        orderId: item.id,
                        responseMessage: '반려하겠습니다',
                      })
                    }
                    approveOrder={() =>
                      approveOrder({
                        orderId: item.id,
                        responseMessage: '',
                      })
                    }
                  />
                }
                onClick={() => router.push(`/admin/purchases/${item.id}`)}
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
