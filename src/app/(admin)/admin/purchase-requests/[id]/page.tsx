'use client';

import { useEffect, useId, useRef, useState } from 'react';

import { useParams, useRouter } from 'next/navigation';

import { ExclamationIcon } from '@/components/icons';
import ChevronIcon from '@/components/icons/ChevronIcon';
import Button from '@/components/ui/Button/Button';
import { ApproveRequestModal } from '@/components/ui/Modal';
import AlertModal from '@/components/ui/Modal/AlertModal';
import type { PurchaseRequestItem } from '@/components/ui/Modal/ApproveRequestModal';
import { useBudget } from '@/hooks/purchase-requests/useBudget';
import { usePurchaseRequestDetail } from '@/hooks/purchase-requests/usePurchaseRequestDetail';
import { ApiError } from '@/lib/services/fetchClient';
import { type Budget } from '@/lib/services/orderBudgetService';
import {
  type OrderDetailItem,
  approveOrder,
  getOrderDetail,
  rejectOrder,
} from '@/lib/services/purchaseRequestService';
import { useModal } from '@/providers/ModalProvider';
import { useToast } from '@/providers/ToastProvider';

import InfoRow from './_components/InfoRow';
import RequestItemRow from './_components/RequestItemRow';

function formatPrice(price: number): string {
  return `${price.toLocaleString()}원`;
}

function formatDate(value: string): string {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}. ${month}. ${day}`;
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

const TOAST_CLASSNAME = 'mx-auto max-w-[1440px] px-6 md:px-6 lg:px-[120px]';

const PAGE_CONTAINER_CLASS =
  'flex w-full flex-col gap-[30px] px-6 pt-[30px] pb-32 lg:w-auto lg:mx-[120px] lg:pt-[60px] lg:pb-20';

export default function PurchaseRequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { openModal, closeModal } = useModal();
  const toast = useToast();

  const { order, isLoading, error: loadError } = usePurchaseRequestDetail(id);
  const { budget, error: budgetError, refetchBudget } = useBudget();
  const [isItemsExpanded, setIsItemsExpanded] = useState<boolean>(true);
  const itemsRegionId = useId();

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
          text: '구매 요청 내역 보기',
          onClick: () => {
            closeModal();
            router.push('/admin/purchase-requests');
          },
        }}
      />,
    );
  }

  const isProcessed = order !== null && order.status !== 'PENDING';

  const openProcessedModalRef = useRef(openProcessedModal);

  useEffect(() => {
    openProcessedModalRef.current = openProcessedModal;
  });

  useEffect(() => {
    if (isProcessed) {
      openProcessedModalRef.current();
    }
  }, [isProcessed]);

  async function isStillPending(): Promise<boolean> {
    const latest = await getOrderDetail(id).catch(() => null);

    if (latest && latest.status !== 'PENDING') {
      openProcessedModal();
      return false;
    }

    return true;
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

  async function handleDecision(
    variant: 'approve' | 'reject',
    responseMessage: string,
  ): Promise<void> {
    if (!order) {
      return;
    }

    try {
      if (variant === 'approve') {
        await approveOrder(order.id, { responseMessage });
      } else {
        await rejectOrder(order.id, { responseMessage });
      }

      closeModal();
      router.push('/admin/purchase-requests');
    } catch (err) {
      const code = err instanceof ApiError ? err.code : undefined;

      if (code === 'BUDGET_EXCEEDED') {
        const latestBudget = await refetchBudget().catch(() => null);
        openBudgetShortageToast(latestBudget?.remainingBudget);
        return;
      }

      closeModal();

      if (code === 'ORDER_ALREADY_PROCESSED' && !(await isStillPending())) {
        return;
      }

      if (code === 'NOT_FOUND') {
        toast.open({
          text: '구매 요청을 찾을 수 없습니다.',
          className: TOAST_CLASSNAME,
        });
        router.push('/admin/purchase-requests');
        return;
      }

      toast.open({
        text: err instanceof Error ? err.message : '처리에 실패했습니다.',
        className: TOAST_CLASSNAME,
      });
    }
  }

  async function handleOpenReject(): Promise<void> {
    if (!order || !(await isStillPending())) {
      return;
    }

    openModal(
      <ApproveRequestModal
        variant="reject"
        requesterName={order.requester.name}
        requesterInitials={order.requester.name.slice(0, 1)}
        items={toModalItems(order.items)}
        orderAmount={order.itemsTotal}
        deliveryFee={order.deliveryFee}
        totalAmount={order.totalPrice}
        onConfirm={(formData) => {
          void handleDecision('reject', formData.responseMessage);
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

  async function handleOpenApprove(): Promise<void> {
    if (!order || !(await isStillPending())) {
      return;
    }

    let latestBudget: Budget;

    try {
      latestBudget = await refetchBudget();
    } catch {
      openRequestFailedModal();
      return;
    }

    if (latestBudget.remainingBudget < order.totalPrice) {
      openBudgetShortageToast(latestBudget.remainingBudget);
      return;
    }

    openModal(
      <ApproveRequestModal
        variant="approve"
        requesterName={order.requester.name}
        requesterInitials={order.requester.name.slice(0, 1)}
        items={toModalItems(order.items)}
        orderAmount={order.itemsTotal}
        deliveryFee={order.deliveryFee}
        totalAmount={order.totalPrice}
        remainingBudget={latestBudget.remainingBudget - order.totalPrice}
        onConfirm={(formData) => {
          void handleDecision('approve', formData.responseMessage);
        }}
      />,
    );
  }

  if (isLoading) {
    return null;
  }

  if (loadError || !order) {
    return (
      <div className={PAGE_CONTAINER_CLASS}>
        <p role="alert" className="text-16-regular text-primary-700">
          {loadError ?? '요청 정보를 찾을 수 없습니다.'}
        </p>
      </div>
    );
  }

  const isBudgetInsufficient =
    budget === null || budget.remainingBudget < order.totalPrice;

  return (
    <article className={PAGE_CONTAINER_CLASS}>
      <h1 className="text-18-bold text-primary-950">구매 요청 상세</h1>

      <section className="flex w-full flex-col gap-5">
        <button
          type="button"
          onClick={() => setIsItemsExpanded((prev) => !prev)}
          aria-expanded={isItemsExpanded}
          aria-controls={isItemsExpanded ? itemsRegionId : undefined}
          className="flex items-start gap-1.5"
        >
          <span className="text-16-bold text-primary-950">요청 품목</span>
          <span className="text-16-regular text-primary-950">
            총 {order.items.length}개
          </span>
          <ChevronIcon
            direction={isItemsExpanded ? 'up' : 'down'}
            className="size-5 text-primary-950"
          />
        </button>

        {isItemsExpanded && (
          <div
            id={itemsRegionId}
            className="flex w-full flex-col gap-5 md:rounded-xs md:bg-white md:px-5 md:pt-5 md:pb-[30px] md:shadow-[0px_0px_3px_rgba(0,0,0,0.1)] lg:px-[60px] lg:py-10"
          >
            <ul className="flex w-full flex-col">
              {order.items.map((item) => (
                <RequestItemRow key={item.productId} item={item} />
              ))}
            </ul>

            <dl className="flex w-full flex-col gap-4">
              <div className="flex items-center justify-between md:px-5">
                <dt className="text-14-bold text-primary-700 md:text-16-bold">
                  주문금액
                </dt>
                <dd className="text-14-bold text-primary-700 md:text-16-bold">
                  {formatPrice(order.itemsTotal)}
                </dd>
              </div>
              <div className="flex items-center justify-between md:px-5">
                <dt className="text-14-bold text-primary-700 md:text-16-bold">
                  배송비
                </dt>
                <dd className="text-14-bold text-primary-700 md:text-16-bold">
                  {formatPrice(order.deliveryFee)}
                </dd>
              </div>
              <div className="flex items-center justify-between md:px-5">
                <dt className="text-18-bold text-primary-950">총 주문금액</dt>
                <dd className="text-18-extrabold text-primary-950 md:text-24-extrabold">
                  {formatPrice(order.totalPrice)}
                </dd>
              </div>
            </dl>
          </div>
        )}
      </section>

      <section className="flex w-full flex-col items-start">
        <div className="flex w-full items-center border-b border-primary-950 py-3.5 md:py-5">
          <span className="text-14-extrabold text-primary-950 md:text-16-extrabold">
            요청 정보
          </span>
        </div>
        <div className="flex w-full flex-wrap">
          <InfoRow label="요청인" value={order.requester.name} paired />
          <InfoRow
            label="요청 날짜"
            value={formatDate(order.createdAt)}
            paired
          />
        </div>
        <InfoRow
          label="요청 메시지"
          value={order.requestMessage ?? '-'}
          multiline
        />
      </section>

      <section className="flex w-full flex-col items-start">
        <div className="flex w-full items-center border-b border-primary-950 py-3.5 md:py-5">
          <span className="text-14-extrabold text-primary-950 md:text-16-extrabold">
            예산 정보
          </span>
        </div>
        {budget && (
          <>
            <InfoRow
              label="이번 달 지출액"
              value={formatPrice(budget.spentAmount)}
            />
            <InfoRow
              label="이번 달 남은 예산"
              value={formatPrice(budget.remainingBudget)}
            />
            <InfoRow
              label="구매 후 예산"
              value={formatPrice(budget.remainingBudget - order.totalPrice)}
              danger={isBudgetInsufficient}
            />
          </>
        )}
        {budgetError && (
          <p
            role="alert"
            className="w-full py-4 text-14-regular text-primary-700"
          >
            {budgetError}
          </p>
        )}
      </section>

      <div className="fixed inset-x-0 bottom-0 z-10 bg-white p-6 lg:static lg:mt-10 lg:flex lg:justify-center lg:bg-transparent lg:p-0">
        <div className="flex gap-4 md:gap-5 lg:w-[616px]">
          <Button
            text="요청 반려"
            variant="secondary"
            className="flex-1"
            onClick={() => {
              void handleOpenReject();
            }}
          />
          <Button
            text="요청 승인"
            className="flex-1"
            disabled={isBudgetInsufficient}
            onClick={() => {
              void handleOpenApprove();
            }}
          />
        </div>
      </div>
    </article>
  );
}
