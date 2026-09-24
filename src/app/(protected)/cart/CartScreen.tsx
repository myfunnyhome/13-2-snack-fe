'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import ExclamationIcon from '@/components/icons/ExclamationIcon';
import Button from '@/components/ui/Button/Button';
import { DeleteConfirmModal } from '@/components/ui/Modal';
import TextArea from '@/components/ui/TextField/TextArea';
import {
  getBudgetSummary,
  getRemainingBudgetAmount,
} from '@/lib/services/budgetService';
import {
  type CartItem,
  getCartItems,
  removeCartItem,
  updateCartItemQuantity,
} from '@/lib/services/cartService';
import { ApiError } from '@/lib/services/fetchClient';
import { createOrder } from '@/lib/services/orderService';
import type { UserRole } from '@/lib/services/userService';
import { useAuth } from '@/providers/AuthProvider';
import { useModal } from '@/providers/ModalProvider';
import { useToast } from '@/providers/ToastProvider';
import { notifyCartUpdated } from '@/utils/cartEvents';
import { cn } from '@/utils/cn';

import CartItemRow from './CartItemRow';
import CartStepper, { type CartStep } from './CartStepper';

const DELIVERY_FEE = 3000;
const OVER_BUDGET_MESSAGE = '이번 달 남은 예산을 초과했습니다.';

const REQUEST_HELPER_TEXT =
  '배송 요청사항이 있다면 입력해 주세요. 입력하지 않아도 구매 요청이 가능합니다.';

function formatPrice(price: number): string {
  return `${price.toLocaleString('ko-KR')}원`;
}

function getSelectedItems(
  items: CartItem[],
  selectedIds: Set<number>,
): CartItem[] {
  return items.filter((item) => selectedIds.has(item.id));
}

function getItemsTotal(items: CartItem[]): number {
  return items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );
}

function isBudgetError(error: unknown): error is ApiError {
  return (
    error instanceof ApiError &&
    (error.code === 'BUDGET_EXCEEDED' || error.code === 'BUDGET_NOT_FOUND')
  );
}

function hasAdminBudgetAccess(role: UserRole | undefined): boolean {
  return role === 'ADMIN' || role === 'SUPER_ADMIN';
}

function getConfirmTargetName(items: CartItem[]): string {
  const firstItem = items[0];

  if (!firstItem) {
    return '';
  }

  if (items.length === 1) {
    return firstItem.product.name;
  }

  return `${firstItem.product.name} 외 ${items.length - 1}건`;
}

export default function CartScreen() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { openModal, closeModal } = useModal();
  const { open: openToast } = useToast();
  const [step, setStep] = useState<CartStep>('cart');
  const [items, setItems] = useState<CartItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [requestMessage, setRequestMessage] = useState<string>('');
  const [orderedItems, setOrderedItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasLoadError, setHasLoadError] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [isBudgetInsufficient, setIsBudgetInsufficient] =
    useState<boolean>(false);
  const [remainingBudget, setRemainingBudget] = useState<number | null>(null);

  const currentRole = user?.role;
  const isInstantBuyer = hasAdminBudgetAccess(currentRole);
  const cartFlow = isInstantBuyer ? 'instant' : 'request';
  const visibleItems = step === 'complete' ? orderedItems : items;
  const selectedItems =
    step === 'complete' ? orderedItems : getSelectedItems(items, selectedIds);
  const itemsTotal = getItemsTotal(selectedItems);
  const deliveryFee = selectedItems.length > 0 ? DELIVERY_FEE : 0;
  const totalPrice = itemsTotal + deliveryFee;
  const hasSelectedItems = selectedItems.length > 0;
  const isReadOnly = step !== 'cart';
  const selectableItems = items.filter((item) => !item.product.isDeleted);
  const isAllSelected =
    selectableItems.length > 0 &&
    selectableItems.every((item) => selectedIds.has(item.id));

  function getOrderTotal(orderItems: CartItem[]): number {
    if (orderItems.length === 0) {
      return 0;
    }

    return getItemsTotal(orderItems) + DELIVERY_FEE;
  }

  function hasExceededBudget(orderItems: CartItem[]): boolean {
    return (
      isInstantBuyer &&
      remainingBudget != null &&
      getOrderTotal(orderItems) > remainingBudget
    );
  }

  const canSubmit =
    hasSelectedItems &&
    !isSubmitting &&
    !isBudgetInsufficient &&
    !hasExceededBudget(selectedItems);
  const budgetErrorMessage =
    purchaseError ??
    (hasExceededBudget(selectedItems) ? OVER_BUDGET_MESSAGE : null);
  const canShowRemainingBudget = isInstantBuyer && remainingBudget != null;

  function updateCartItems(nextItems: CartItem[]): void {
    setItems(nextItems);
  }

  useEffect(() => {
    let isMounted = true;

    async function loadCartItems(): Promise<void> {
      try {
        const cartItems = await getCartItems();

        if (!isMounted) {
          return;
        }

        setItems(cartItems);
        setHasLoadError(false);
        setSelectedIds(
          new Set(
            cartItems
              .filter((item) => !item.product.isDeleted)
              .map((item) => item.id),
          ),
        );
      } catch {
        if (isMounted) {
          setItems([]);
          setHasLoadError(true);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadCartItems();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (isAuthLoading || !hasAdminBudgetAccess(currentRole)) {
      return;
    }

    let isMounted = true;

    async function loadRemainingBudget(): Promise<void> {
      try {
        const summary = await getBudgetSummary();

        if (isMounted) {
          setRemainingBudget(
            getRemainingBudgetAmount(summary.currentMonthBudget),
          );
        }
      } catch {
        if (isMounted) {
          setRemainingBudget(null);
        }
      }
    }

    void loadRemainingBudget();

    return () => {
      isMounted = false;
    };
  }, [currentRole, isAuthLoading]);

  async function refreshRemainingBudget(): Promise<void> {
    if (!hasAdminBudgetAccess(currentRole)) {
      return;
    }

    try {
      const summary = await getBudgetSummary();
      setRemainingBudget(getRemainingBudgetAmount(summary.currentMonthBudget));
    } catch {
      return;
    }
  }

  function clearPurchaseError(): void {
    setPurchaseError(null);
    setIsBudgetInsufficient(false);
  }

  function handleToggleAll(): void {
    clearPurchaseError();

    if (isAllSelected) {
      setSelectedIds(new Set());
      return;
    }

    setSelectedIds(new Set(selectableItems.map((item) => item.id)));
  }

  function handleToggleItem(cartItemId: number): void {
    clearPurchaseError();
    setSelectedIds((currentIds) => {
      const nextIds = new Set(currentIds);

      if (nextIds.has(cartItemId)) {
        nextIds.delete(cartItemId);
      } else {
        nextIds.add(cartItemId);
      }

      return nextIds;
    });
  }

  async function handleQuantityChange(
    cartItemId: number,
    quantity: number,
  ): Promise<void> {
    const previousItems = items;

    clearPurchaseError();
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === cartItemId ? { ...item, quantity } : item,
      ),
    );

    try {
      const updatedItem = await updateCartItemQuantity(cartItemId, quantity);
      setItems((currentItems) =>
        currentItems.map((item) =>
          item.id === cartItemId ? updatedItem : item,
        ),
      );
    } catch {
      setItems(previousItems);
      openToast({ text: '수량을 변경하지 못했습니다.' });
    }
  }

  async function handleRemoveItems(cartItemIds: number[]): Promise<void> {
    if (cartItemIds.length === 0) {
      return;
    }

    const previousItems = items;
    const previousSelectedIds = selectedIds;
    const idsToRemove = new Set(cartItemIds);

    const nextItems = items.filter((item) => !idsToRemove.has(item.id));

    clearPurchaseError();
    updateCartItems(nextItems);
    setSelectedIds((currentIds) => {
      const nextIds = new Set(currentIds);
      cartItemIds.forEach((cartItemId) => {
        nextIds.delete(cartItemId);
      });
      return nextIds;
    });

    try {
      await Promise.all(
        cartItemIds.map((cartItemId) => removeCartItem(cartItemId)),
      );
      notifyCartUpdated();
    } catch {
      updateCartItems(previousItems);
      setSelectedIds(previousSelectedIds);
      openToast({ text: '상품을 삭제하지 못했습니다.' });
    }
  }

  function handleOpenDeleteModal(itemsToDelete: CartItem[]): void {
    if (itemsToDelete.length === 0) {
      return;
    }

    openModal(
      <DeleteConfirmModal
        variant="product"
        targetName={getConfirmTargetName(itemsToDelete)}
        onConfirm={() => {
          closeModal();
          void handleRemoveItems(itemsToDelete.map((item) => item.id));
        }}
      />,
    );
  }

  function handleOpenCancelOrderModal(): void {
    openModal(
      <DeleteConfirmModal
        variant="purchaseRequest"
        targetName={getConfirmTargetName(selectedItems)}
        onConfirm={() => {
          closeModal();
          setStep('cart');
        }}
      />,
    );
  }

  function handleCancel(): void {
    router.push('/products');
  }

  function handleGoToOrder(): void {
    if (!hasSelectedItems) {
      return;
    }

    setStep('order');
  }

  async function handleSubmitOrder(itemsToOrder: CartItem[]): Promise<void> {
    if (
      itemsToOrder.length === 0 ||
      isSubmitting ||
      isBudgetInsufficient ||
      hasExceededBudget(itemsToOrder)
    ) {
      return;
    }

    const orderedIds = new Set(itemsToOrder.map((item) => item.id));

    setIsSubmitting(true);
    setPurchaseError(null);

    try {
      const trimmedMessage = requestMessage.trim();

      await createOrder({
        items: itemsToOrder.map((item) => ({
          cartItemId: item.id,
          quantity: item.quantity,
        })),
        requestMessage:
          isInstantBuyer || trimmedMessage === '' ? undefined : trimmedMessage,
      });

      setOrderedItems(itemsToOrder);
      updateCartItems(items.filter((item) => !orderedIds.has(item.id)));
      setSelectedIds(new Set());
      setIsBudgetInsufficient(false);
      setStep('complete');

      notifyCartUpdated();
      await refreshRemainingBudget();
    } catch (error: unknown) {
      if (isBudgetError(error)) {
        setIsBudgetInsufficient(true);
        setPurchaseError(error.message);
        await refreshRemainingBudget();
        return;
      }

      openToast({
        text: isInstantBuyer
          ? '구매에 실패했습니다.'
          : '구매 요청에 실패했습니다.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  function handlePrimaryCartAction(): void {
    if (isInstantBuyer) {
      void handleSubmitOrder(selectedItems);
      return;
    }

    handleGoToOrder();
  }

  function handleInstantItemAction(item: CartItem): void {
    void handleSubmitOrder([item]);
  }

  function handleBackToCart(): void {
    setOrderedItems([]);
    setRequestMessage('');
    setPurchaseError(null);
    setIsBudgetInsufficient(false);
    setStep('cart');
  }

  function handleGoToHistory(): void {
    router.push(isInstantBuyer ? '/admin/purchases' : '/purchases');
  }

  return (
    <div className="mx-auto w-full max-w-[1200px] px-6 py-8 md:px-8 lg:px-[100px] lg:py-12">
      <CartStepper
        currentStep={step}
        flow={cartFlow}
        className="mb-10 md:mb-14"
      />

      {step === 'complete' ? (
        <h1 className="text-24-bold mb-10 text-center text-primary-950 md:mb-14">
          {isInstantBuyer
            ? '구매가 완료되었습니다.'
            : '구매 요청이 완료되었습니다.'}
        </h1>
      ) : null}

      {isLoading || isAuthLoading ? (
        <p className="text-16-regular py-20 text-center text-primary-500">
          장바구니를 불러오는 중입니다.
        </p>
      ) : visibleItems.length === 0 ? (
        <div className="flex flex-col items-center gap-6 py-20">
          <p className="text-16-regular text-primary-500">
            {hasLoadError
              ? '장바구니를 불러오지 못했습니다.'
              : '장바구니가 비어 있습니다.'}
          </p>
          <Button
            text="상품 보러 가기"
            size="md"
            className="max-w-[240px]"
            onClick={() => router.push('/products')}
          />
        </div>
      ) : (
        <>
          <section>
            <div
              className={cn(
                'grid transition-[grid-template-rows] duration-300 ease-out',
                budgetErrorMessage ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
              )}
              aria-hidden={!budgetErrorMessage}
            >
              <div className="overflow-hidden">
                <div
                  className={cn(
                    'mb-4 flex items-center gap-2 bg-primary-950 px-4 py-3 text-white transition duration-300 ease-out',
                    budgetErrorMessage
                      ? 'translate-y-0 opacity-100'
                      : '-translate-y-1 opacity-0',
                  )}
                >
                  <ExclamationIcon className="size-5 shrink-0" />
                  <p className="text-14-regular">
                    {budgetErrorMessage ?? OVER_BUDGET_MESSAGE}
                  </p>
                </div>
              </div>
            </div>
            {step === 'cart' ? (
              <div className="mb-2 flex items-center justify-between gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    disabled={selectableItems.length === 0}
                    onChange={handleToggleAll}
                    className="size-5 accent-primary-950"
                  />
                  <span className="text-16-bold text-primary-950">
                    전체 선택 ({selectableItems.length}개)
                  </span>
                </label>
                <button
                  type="button"
                  disabled={!hasSelectedItems}
                  onClick={() => handleOpenDeleteModal(selectedItems)}
                  className="text-14-regular text-primary-700 disabled:text-primary-300"
                >
                  선택삭제
                </button>
              </div>
            ) : (
              <h2 className="text-16-bold mb-2 text-primary-950">
                주문 목록 총 {visibleItems.length}개
              </h2>
            )}
            <div>
              {visibleItems.map((item) => (
                <CartItemRow
                  key={item.id}
                  name={item.product.name}
                  imageUrl={item.product.imageUrl}
                  unitPrice={item.product.price}
                  quantity={item.quantity}
                  isSelected={selectedIds.has(item.id)}
                  isReadOnly={isReadOnly}
                  canSelect={!item.product.isDeleted}
                  onToggle={() => handleToggleItem(item.id)}
                  onQuantityChange={(quantity) => {
                    void handleQuantityChange(item.id, quantity);
                  }}
                  instantActionLabel={
                    isInstantBuyer ? '바로 구매' : '바로 요청'
                  }
                  isInstantActionDisabled={
                    isSubmitting ||
                    isBudgetInsufficient ||
                    item.product.isDeleted ||
                    hasExceededBudget([item])
                  }
                  onInstantAction={() => {
                    handleInstantItemAction(item);
                  }}
                />
              ))}
            </div>
          </section>

          <section className="mt-8 flex flex-col gap-2 border-b border-primary-100 pb-8">
            <div className="flex justify-between">
              <span className="text-16-regular text-primary-700">주문금액</span>
              <span className="text-16-regular text-primary-950">
                {formatPrice(itemsTotal)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-16-regular text-primary-700">배송비</span>
              <span className="text-16-regular text-primary-950">
                {formatPrice(deliveryFee)}
              </span>
            </div>
            <div className="mt-2 flex justify-between">
              <span className="text-16-bold text-primary-950">총 주문금액</span>
              <span className="text-16-bold text-primary-950">
                {formatPrice(totalPrice)}
              </span>
            </div>
            {canShowRemainingBudget ? (
              <div className="mt-2 flex justify-between">
                <span className="text-16-bold text-primary-950">
                  남은 예산 금액
                </span>
                <span className="text-16-bold text-primary-950">
                  {formatPrice(remainingBudget)}
                </span>
              </div>
            ) : null}
          </section>

          {!isInstantBuyer && (step === 'order' || step === 'complete') ? (
            <section className="mt-8">
              <h2 className="text-16-bold mb-3 text-primary-950">요청사항</h2>
              <TextArea
                value={requestMessage}
                readOnly={step === 'complete'}
                onChange={(event) => setRequestMessage(event.target.value)}
                placeholder="요청사항을 입력해 주세요"
                helperText={step === 'order' ? REQUEST_HELPER_TEXT : undefined}
                textareaClassName="h-[165px]"
              />
            </section>
          ) : null}

          <div
            className={cn(
              'mt-10 flex flex-col gap-4',
              step === 'cart' &&
                'md:flex-row md:items-center md:justify-between',
            )}
          >
            {step === 'cart' ? (
              <div className="flex flex-col gap-2">
                <p className="text-20-bold text-primary-950">
                  총 주문금액 {formatPrice(totalPrice)}
                </p>
                {canShowRemainingBudget ? (
                  <p className="text-16-regular text-primary-700">
                    남은 예산 {formatPrice(remainingBudget)}
                  </p>
                ) : null}
              </div>
            ) : null}

            <div className="flex gap-3 md:ml-auto md:w-[420px]">
              {step === 'cart' ? (
                <>
                  <Button
                    text="취소"
                    variant="secondary"
                    size="md"
                    onClick={handleCancel}
                  />
                  <Button
                    text={isInstantBuyer ? '구매하기' : '구매 요청'}
                    size="md"
                    disabled={!canSubmit}
                    onClick={handlePrimaryCartAction}
                  />
                </>
              ) : null}

              {step === 'order' ? (
                <>
                  <Button
                    text="취소"
                    variant="secondary"
                    size="md"
                    disabled={isSubmitting}
                    onClick={handleOpenCancelOrderModal}
                  />
                  <Button
                    text="구매 요청"
                    size="md"
                    disabled={!canSubmit}
                    onClick={() => {
                      void handleSubmitOrder(selectedItems);
                    }}
                  />
                </>
              ) : null}

              {step === 'complete' ? (
                <>
                  <Button
                    text="장바구니로 돌아가기"
                    variant="secondary"
                    size="md"
                    onClick={handleBackToCart}
                  />
                  <Button
                    text={isInstantBuyer ? '구매내역 확인' : '요청내역 확인'}
                    size="md"
                    onClick={handleGoToHistory}
                  />
                </>
              ) : null}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
