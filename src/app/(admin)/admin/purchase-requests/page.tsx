'use client';

import { Suspense, useEffect, useRef, useState } from 'react';

import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import emptyIcon from '@/assets/icons/empty.svg';
import { ExclamationIcon } from '@/components/icons';
import Button from '@/components/ui/Button/Button';
import DropdownButton from '@/components/ui/Dropdown/DropdownButton';
import DropdownItem from '@/components/ui/Dropdown/DropdownItem';
import Pagination from '@/components/ui/List/Pagination';
import RequestList from '@/components/ui/List/RequestList';
import { ApproveRequestModal } from '@/components/ui/Modal';
import AlertModal from '@/components/ui/Modal/AlertModal';
import type { PurchaseRequestItem } from '@/components/ui/Modal/ApproveRequestModal';
import { ApiError } from '@/lib/services/fetchClient';
import { type Budget, getBudget } from '@/lib/services/orderBudgetService';
import {
  type OrderDetailItem,
  type OrderListItem,
  type OrderListSort,
  approveOrder,
  getOrderDetail,
  getOrgOrders,
  rejectOrder,
} from '@/lib/services/purchaseRequestService';
import { useModal } from '@/providers/ModalProvider';
import { useToast } from '@/providers/ToastProvider';

const TOAST_CLASSNAME = 'mx-auto max-w-[1440px] px-6 md:px-6 lg:px-[120px]';

function formatPrice(price: number): string {
  return `${price.toLocaleString()}원`;
}

function formatProductInfo(item: OrderListItem): string {
  if (item.totalItemCount <= 1) {
    return item.representativeProductName;
  }

  return `${item.representativeProductName} 외 ${item.totalItemCount - 1}건`;
}

function toModalItems(items: OrderDetailItem[]): PurchaseRequestItem[] {
  return items.map((item) => ({
    id: item.productId,
    productName: item.productName,
    imageUrl: item.imageUrl,
    quantity: item.quantity,
    priceAtOrder: item.priceAtOrder,
    totalPrice: item.subtotal,
  }));
}

const ORDER_LIST_SORTS: OrderListSort[] = ['latest', 'lowPrice', 'highPrice'];

function isOrderListSort(value: string | null): value is OrderListSort {
  return ORDER_LIST_SORTS.includes(value as OrderListSort);
}

function hasInsufficientBudgetForList(
  items: OrderListItem[],
  budget: Budget | null,
): boolean {
  if (budget === null || items.length === 0) {
    return false;
  }

  const minPrice = Math.min(...items.map((item) => item.totalPrice));

  return budget.remainingBudget < minPrice;
}

function getBreakpoint(width: number): 'sm' | 'md' | 'lg' {
  if (width < 744) return 'sm';
  if (width < 1440) return 'md';
  return 'lg';
}

function useBreakpoint(): 'sm' | 'md' | 'lg' {
  const [breakpoint, setBreakpoint] = useState<'sm' | 'md' | 'lg'>('lg');

  useEffect(() => {
    const handleResize = () => {
      setBreakpoint(getBreakpoint(window.innerWidth));
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return breakpoint;
}

function EmptyState() {
  return (
    <div className="flex w-full flex-1 items-center justify-center py-[130px] md:py-[202px] lg:py-[151px]">
      <div className="flex w-[310px] flex-col items-center gap-5 md:gap-[30px]">
        <Image src={emptyIcon} alt="" width={100} height={100} />
        <div className="flex w-full flex-col items-center gap-10 md:gap-[50px]">
          <div className="flex w-full flex-col items-center gap-2.5 text-center">
            <p className="text-18-extrabold text-primary-950 md:text-24-extrabold">
              요청 내역이 없어요
            </p>
            <p className="text-14-regular-lead text-primary-800 md:text-16-regular-lead">
              상품 리스트를 둘러보고
              <br />
              상품을 담아보세요
            </p>
          </div>
          <Button text="상품 리스트로 이동" />
        </div>
      </div>
    </div>
  );
}

function PurchaseRequestsView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { openModal, closeModal } = useModal();
  const toast = useToast();

  const sortParam = searchParams.get('sort');
  const sort = isOrderListSort(sortParam) ? sortParam : undefined;

  const pageParam = Number(searchParams.get('page'));
  const page = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1;

  const [requests, setRequests] = useState<OrderListItem[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [budget, setBudget] = useState<Budget | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<number>(0);
  const breakpoint = useBreakpoint();

  function updateQuery(
    updates: Record<string, string>,
    mode: 'push' | 'replace',
  ): void {
    const params = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(updates)) {
      params.set(key, value);
    }

    router[mode](`${pathname}?${params.toString()}`, { scroll: false });
  }

  const isListBudgetInsufficient = hasInsufficientBudgetForList(
    requests,
    budget,
  );

  const openBudgetShortageToastRef = useRef(openBudgetShortageToast);

  useEffect(() => {
    openBudgetShortageToastRef.current = openBudgetShortageToast;
  });

  useEffect(() => {
    if (isListBudgetInsufficient) {
      openBudgetShortageToastRef.current(budget?.remainingBudget);
    }
  }, [isListBudgetInsufficient, budget]);

  useEffect(() => {
    let isMounted = true;

    async function load(): Promise<void> {
      setIsLoading(true);
      setLoadError(null);

      try {
        const [ordersResult, budgetResult] = await Promise.all([
          getOrgOrders({ status: 'PENDING', sort, page }),
          getBudget().catch(() => null),
        ]);

        if (isMounted) {
          setRequests(ordersResult.items);
          setTotalPages(ordersResult.totalPages);
          setBudget(budgetResult);
        }
      } catch (err) {
        if (isMounted) {
          setLoadError(
            err instanceof Error ? err.message : '목록을 불러오지 못했습니다.',
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void load();

    return () => {
      isMounted = false;
    };
  }, [sort, page, refreshToken]);

  function handleSortChange(value: string): void {
    updateQuery({ sort: value, page: '1' }, 'replace');
  }

  function handlePageChange(nextPage: number): void {
    updateQuery({ page: String(nextPage) }, 'replace');
  }

  function openProcessedModal(): void {
    openModal(
      <AlertModal
        title="처리된 요청"
        descriptions={[
          '이미 처리된 요청이에요!',
          '목록에서 다른 요청을 확인해보세요',
        ]}
        secondaryAction={{
          text: '홈으로',
          onClick: () => {
            closeModal();
            router.push('/');
          },
        }}
        primaryAction={{
          text: '확인',
          onClick: () => {
            closeModal();
            setRefreshToken((prev) => prev + 1);
          },
        }}
      />,
    );
  }

  function openRequestFailedModal(): void {
    openModal(
      <AlertModal
        title="요청 실패"
        descriptions={[
          '잠시 후 다시 시도해주세요!',
          '문제가 계속되면 담당자에게 문의해주세요',
        ]}
        secondaryAction={{
          text: '홈으로',
          onClick: () => {
            closeModal();
            router.push('/');
          },
        }}
        primaryAction={{
          text: '돌아가기',
          onClick: closeModal,
        }}
      />,
    );
  }

  function openBudgetShortageToast(remainingBudget?: number): void {
    toast.open({
      icon: <ExclamationIcon className="size-6 text-red" />,
      text: '예산이 부족합니다. 수량을 줄이거나 항목을 제거해주세요.',
      secondaryText:
        remainingBudget === undefined
          ? undefined
          : `남은 예산 ${formatPrice(remainingBudget)}`,
      className: TOAST_CLASSNAME,
    });
  }

  async function handleConfirmDecision(
    variant: 'approve' | 'reject',
    id: number,
    responseMessage: string,
  ): Promise<void> {
    try {
      if (variant === 'approve') {
        await approveOrder(id, { responseMessage });
      } else {
        await rejectOrder(id, { responseMessage });
      }

      closeModal();
      setRefreshToken((prev) => prev + 1);
    } catch (err) {
      const code = err instanceof ApiError ? err.code : undefined;

      if (code === 'BUDGET_EXCEEDED') {
        const latestBudget = await getBudget().catch(() => null);
        openBudgetShortageToast(latestBudget?.remainingBudget);
        return;
      }

      closeModal();

      if (code === 'ORDER_ALREADY_PROCESSED') {
        openProcessedModal();
        return;
      }

      toast.open({
        text: err instanceof Error ? err.message : '처리에 실패했습니다.',
        className: TOAST_CLASSNAME,
      });
      setRefreshToken((prev) => prev + 1);
    }
  }

  async function handleOpenDecision(
    variant: 'approve' | 'reject',
    item: OrderListItem,
  ): Promise<void> {
    let detail;

    try {
      detail = await getOrderDetail(item.id);
    } catch {
      openRequestFailedModal();
      return;
    }

    if (detail.status !== 'PENDING') {
      openProcessedModal();
      return;
    }

    if (variant === 'reject') {
      openModal(
        <ApproveRequestModal
          variant="reject"
          requesterName={detail.requester.name}
          requesterInitials={detail.requester.name.slice(0, 1)}
          items={toModalItems(detail.items)}
          orderAmount={detail.itemsTotal}
          deliveryFee={detail.deliveryFee}
          totalAmount={detail.totalPrice}
          onConfirm={(formData) => {
            void handleConfirmDecision(
              'reject',
              detail.id,
              formData.responseMessage,
            );
          }}
        />,
      );
      return;
    }

    const latestBudget = await getBudget().catch(() => null);

    if (!latestBudget) {
      openRequestFailedModal();
      return;
    }

    if (latestBudget.remainingBudget < detail.totalPrice) {
      openBudgetShortageToast(latestBudget.remainingBudget);
      return;
    }

    openModal(
      <ApproveRequestModal
        variant="approve"
        requesterName={detail.requester.name}
        requesterInitials={detail.requester.name.slice(0, 1)}
        items={toModalItems(detail.items)}
        orderAmount={detail.itemsTotal}
        deliveryFee={detail.deliveryFee}
        totalAmount={detail.totalPrice}
        remainingBudget={latestBudget.remainingBudget - detail.totalPrice}
        onConfirm={(formData) => {
          void handleConfirmDecision(
            'approve',
            detail.id,
            formData.responseMessage,
          );
        }}
      />,
    );
  }

  const isEmpty = !isLoading && !loadError && requests.length === 0;

  return (
    <div className="flex flex-col gap-3 px-6 pt-[30px] md:gap-5 md:pt-5 lg:gap-10 lg:pt-20">
      <div className="flex items-center justify-between">
        <h1 className="text-16-bold text-primary-950 md:text-18-bold">
          구매 요청 관리
        </h1>
        {!isEmpty && (
          <DropdownButton
            value={sort}
            onChange={handleSortChange}
            placeholder="정렬"
            containerClassName="w-[110px]"
            className="h-11 border-primary-100 px-4 py-2.5 text-16-regular"
          >
            <DropdownItem value="latest">최신순</DropdownItem>
            <DropdownItem value="lowPrice">낮은 가격순</DropdownItem>
            <DropdownItem value="highPrice">높은 가격순</DropdownItem>
          </DropdownButton>
        )}
      </div>

      {loadError && (
        <p className="w-full py-10 text-center text-16-regular text-primary-700">
          {loadError}
        </p>
      )}

      {isEmpty && <EmptyState />}

      {!loadError && !isEmpty && requests.length > 0 && (
        <div className="flex w-full flex-col items-end gap-[30px]">
          <div className="flex w-full flex-col items-start">
            <div className="hidden w-full border-y border-primary-100 py-5 md:flex md:items-center md:justify-between lg:justify-start lg:gap-20 lg:px-10">
              <span className="w-[100px] text-16-bold text-primary-500 lg:w-[142px]">
                구매 요청일
              </span>
              <span className="w-[140px] text-16-bold text-primary-500 lg:w-90">
                상품 정보
              </span>
              <span className="w-[100px] text-16-bold text-primary-500 lg:w-[142px]">
                주문 금액
              </span>
              <span className="w-[108px] text-16-bold text-primary-500 lg:w-[134px]">
                요청인
              </span>
              <span className="w-[168px] text-16-bold text-primary-500 lg:w-[180px]">
                비고
              </span>
            </div>
            {requests.map((request) => (
              <RequestList
                key={request.id}
                createdAt={request.createdAt}
                productInfo={formatProductInfo(request)}
                price={request.totalPrice}
                requesterName={request.requester.name}
                approveDisabled={
                  budget === null || budget.remainingBudget < request.totalPrice
                }
                onApprove={() => {
                  void handleOpenDecision('approve', request);
                }}
                onReject={() => {
                  void handleOpenDecision('reject', request);
                }}
                size={breakpoint}
              />
            ))}
          </div>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            size={breakpoint === 'sm' ? 'sm' : 'lg'}
          />
        </div>
      )}
    </div>
  );
}

export default function PurchaseRequestsPage() {
  return (
    <Suspense>
      <PurchaseRequestsView />
    </Suspense>
  );
}
