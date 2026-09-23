// 사용법:
// <PurchaseList name="상품명" createdAt={날짜} price={1900} status="pending" statusMessage="승인대기" statusIcon={아이콘경로} onCancel={취소콜백} size="lg" />
// size: 'sm'(MO) / 'md'(TB) / 'lg'(PC, 기본)
// status/statusMessage: 상태별 라벨은 페이지가 결정, PurchaseList는 Badge props로 조립만 함
// statusIcon: Badge가 variant별 아이콘을 자체 결정하진 않으므로, 페이지가 넣고 싶을 때만 쓰는 옵셔널 통로
// 요청 취소 버튼은 status가 'pending'일 때만 보인다(md/lg는 자리만 비움, sm은 버튼 생략).
'use client';

import Badge from '@/components/ui/Badge/Badge';
import type { BadgeProps } from '@/components/ui/Badge/Badge.types';
import Button from '@/components/ui/Button/Button';
import { cn } from '@/utils/cn';

type PurchaseListSize = 'sm' | 'md' | 'lg';
type PurchaseStatus = Extract<BadgeProps, { type: 'status' }>['variant'];
type BadgeIcon = BadgeProps['icon'];

function formatDate(date: string | Date): string {
  const target = new Date(date);
  const year = target.getFullYear();
  const month = String(target.getMonth() + 1).padStart(2, '0');
  const day = String(target.getDate()).padStart(2, '0');
  return `${year}. ${month}. ${day}`;
}

function formatPrice(price: number): string {
  return price.toLocaleString();
}

type PurchaseListProps = {
  name: string;
  createdAt: string | Date;
  price: number;
  status: PurchaseStatus;
  statusMessage: string;
  statusIcon?: BadgeIcon;
  onCancel: () => void;
  size?: PurchaseListSize;
  className?: string;
};

export default function PurchaseList({
  name,
  createdAt,
  price,
  status,
  statusMessage,
  statusIcon,
  onCancel,
  size = 'lg',
  className,
}: PurchaseListProps) {
  const formattedDate = formatDate(createdAt);
  const formattedPrice = formatPrice(price);
  const isCancelable = status === 'pending';
  const statusBadge = (
    <Badge
      type="STATUS"
      variant={status}
      message={statusMessage}
      icon={statusIcon}
    />
  );

  if (size === 'sm') {
    return (
      <div
        className={cn(
          'flex w-full flex-col gap-5 border-b border-primary-100 py-[30px]',
          className,
        )}
      >
        <div className="flex w-full items-center justify-between">
          <p className="text-14-bold text-primary-950">{formattedDate}</p>
          {statusBadge}
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-14-regular text-primary-950">{name}</p>
          <p className="text-14-regular text-primary-950">{formattedPrice}원</p>
        </div>
        {isCancelable ? (
          <Button
            text="요청 취소"
            variant="secondary"
            size="sm"
            onClick={onCancel}
          />
        ) : null}
      </div>
    );
  }

  if (size === 'md') {
    return (
      <div
        className={cn(
          'flex h-25 w-full items-center justify-between border-b border-primary-100',
          className,
        )}
      >
        <p className="w-25 text-16-regular text-primary-950">{formattedDate}</p>
        <p className="w-35 text-16-regular text-primary-950">{name}</p>
        <p className="w-25 text-16-regular text-primary-950">
          {formattedPrice}
        </p>
        <div className="w-25">{statusBadge}</div>
        {isCancelable ? (
          <Button
            text="요청 취소"
            variant="secondary"
            size="sm"
            onClick={onCancel}
            className="w-24 shrink-0"
          />
        ) : (
          <div className="w-24 shrink-0" />
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex h-25 w-full items-center gap-20 border-b border-primary-100 px-10',
        className,
      )}
    >
      <p className="w-45 text-16-regular text-primary-950">{formattedDate}</p>
      <p className="w-65 text-16-regular text-primary-950">{name}</p>
      <p className="w-45 text-16-regular text-primary-950">{formattedPrice}</p>
      <div className="w-45">{statusBadge}</div>
      {isCancelable ? (
        <Button
          text="요청 취소"
          variant="secondary"
          size="sm"
          onClick={onCancel}
          className="w-24 shrink-0"
        />
      ) : (
        <div className="w-24 shrink-0" />
      )}
    </div>
  );
}
