'use client';

import { useState } from 'react';

import PlusMinusIcon from '@/components/icons/PlusMinusIcon';
import Button from '@/components/ui/Button/Button';
import ProductImage from '@/components/ui/ProductImage/ProductImage';
import { cn } from '@/utils/cn';

const MAX_QUANTITY = 999;
const MIN_QUANTITY = 1;
const THUMBNAIL_SIZE = 80;

type CartItemRowProps = {
  name: string;
  imageUrl: string | null;
  unitPrice: number;
  quantity: number;
  isSelected: boolean;
  isReadOnly: boolean;
  canSelect: boolean;
  onToggle: () => void;
  onQuantityChange: (quantity: number) => void;
  instantActionLabel: string;
  onInstantAction: () => void;
  isInstantActionDisabled?: boolean;
  className?: string;
};

function formatPrice(price: number): string {
  return `${price.toLocaleString('ko-KR')}원`;
}

function clampQuantity(value: number): number {
  return Math.min(MAX_QUANTITY, Math.max(MIN_QUANTITY, value));
}

export default function CartItemRow({
  name,
  imageUrl,
  unitPrice,
  quantity,
  isSelected,
  isReadOnly,
  canSelect,
  onToggle,
  onQuantityChange,
  instantActionLabel,
  onInstantAction,
  isInstantActionDisabled = false,
  className,
}: CartItemRowProps) {
  const [draftQuantity, setDraftQuantity] = useState<string>(String(quantity));
  const [isEditingQuantity, setIsEditingQuantity] = useState<boolean>(false);
  const lineTotal = unitPrice * quantity;
  const canDecrease = !isReadOnly && quantity > MIN_QUANTITY;
  const canIncrease = !isReadOnly && quantity < MAX_QUANTITY;
  const displayedQuantity = isEditingQuantity
    ? draftQuantity
    : String(quantity);

  function commitDraftQuantity(): void {
    const parsedQuantity = Number(draftQuantity);
    const nextQuantity = Number.isInteger(parsedQuantity)
      ? clampQuantity(parsedQuantity)
      : quantity;

    setIsEditingQuantity(false);
    setDraftQuantity(String(nextQuantity));

    if (nextQuantity !== quantity) {
      onQuantityChange(nextQuantity);
    }
  }

  return (
    <div
      className={cn(
        'flex items-start gap-3 border-b border-primary-100 py-6 md:items-center md:gap-6',
        className,
      )}
    >
      {isReadOnly ? null : (
        <input
          type="checkbox"
          checked={isSelected}
          disabled={!canSelect}
          onChange={onToggle}
          aria-label={`${name} 선택`}
          className="mt-8 size-5 shrink-0 accent-primary-950 md:mt-0"
        />
      )}

      {imageUrl ? (
        <ProductImage
          src={imageUrl}
          alt={name}
          size={THUMBNAIL_SIZE}
          background="bg-primary-50"
          className="rounded-[2px]"
        />
      ) : (
        <div
          className="size-20 shrink-0 rounded-[2px] bg-primary-50"
          aria-hidden
        />
      )}

      <div className="flex min-w-0 flex-1 items-start justify-between gap-4 md:items-center">
        <div className="min-w-0">
          <p className="text-16-regular truncate text-primary-950">{name}</p>
          <p className="text-14-regular mt-1 text-primary-700">
            {formatPrice(unitPrice)}
          </p>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          {isReadOnly ? (
            <p className="text-14-regular text-primary-700">수량 {quantity}</p>
          ) : (
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label={`${name} 수량 줄이기`}
                disabled={!canDecrease}
                onClick={() => onQuantityChange(quantity - 1)}
                className="flex size-6 items-center justify-center text-primary-950 disabled:text-primary-300"
              >
                <PlusMinusIcon isMinus className="size-3" />
              </button>
              <input
                type="text"
                inputMode="numeric"
                aria-label={`${name} 수량`}
                value={displayedQuantity}
                onFocus={() => {
                  setIsEditingQuantity(true);
                  setDraftQuantity(String(quantity));
                }}
                onChange={(event) => {
                  const nextValue = event.target.value.replace(/[^\d]/g, '');
                  setIsEditingQuantity(true);
                  setDraftQuantity(nextValue);
                }}
                onBlur={commitDraftQuantity}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.currentTarget.blur();
                  }
                }}
                className="text-14-regular h-6 w-8 bg-transparent text-center text-primary-950 outline-none"
              />
              <button
                type="button"
                aria-label={`${name} 수량 늘리기`}
                disabled={!canIncrease}
                onClick={() => onQuantityChange(quantity + 1)}
                className="flex size-6 items-center justify-center text-primary-950 disabled:text-primary-300"
              >
                <PlusMinusIcon className="size-3" />
              </button>
            </div>
          )}
          <p className="text-16-bold text-primary-950">
            {formatPrice(lineTotal)}
          </p>
          {isReadOnly ? null : (
            <Button
              text={instantActionLabel}
              variant="secondary"
              size="sm"
              disabled={isInstantActionDisabled}
              onClick={onInstantAction}
              className="h-8 w-auto px-3 text-14-regular"
            />
          )}
        </div>
      </div>
    </div>
  );
}
