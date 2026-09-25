import type { ReactNode } from 'react';

import Badge from '@/components/ui/Badge/Badge';
import Button from '@/components/ui/Button/Button';
import { statusBadgeMenu } from '@/constants/badgeMenu';
import type { MyOrderStatus } from '@/lib/services/orderService';
import { formatDate } from '@/utils/date';

import Profile from '../Profile/Profile';

type PurchaseListItemProps = {
  date: string;
  product: string;
  price: number;
  status: MyOrderStatus;
  onClick: () => void;
  onCancel: () => void;
};

export function PurchaseListItemMobile({
  date,
  product,
  price,
  status,
  onClick,
  onCancel,
}: PurchaseListItemProps) {
  const statusData = statusBadgeMenu.find((menu) => menu.label === status);
  if (!statusData) {
    return null;
  }
  return (
    <div
      onClick={onClick}
      className="w-full border-b border-primary-100 py-[30px] cursor-pointer"
    >
      <div className="flex justify-between items-center mb-[10px]">
        <p className="text-14-bold">{formatDate(date)}</p>
        <Badge
          type="STATUS"
          variant={statusData.label}
          message={statusData.name}
          icon={statusData.icon}
        />
      </div>
      <p>{product}</p>
      <p>{price.toLocaleString()}원</p>
      {status === 'PENDING' && (
        <Button
          text="요청 취소"
          variant="secondary"
          onClick={onCancel}
          className="h-[40px] text-16-regular mt-[20px]"
        />
      )}
    </div>
  );
}
export function PurchaseListItem({
  date,
  product,
  price,
  status,
  onClick,
  onCancel,
}: PurchaseListItemProps) {
  const statusData = statusBadgeMenu.find((menu) => menu.label === status);
  if (!statusData) {
    return null;
  }
  return (
    <div
      onClick={onClick}
      className="w-full h-[100px] border-b border-primary-100 grid grid-cols-5 flex items-center cursor-pointer"
    >
      <div>{formatDate(date)}</div>
      <div>{product}</div>
      <div>{price.toLocaleString()}</div>
      <Badge
        type="STATUS"
        variant={statusData.label}
        message={statusData.name}
        icon={statusData.icon}
      />
      {status === 'PENDING' && (
        <Button
          text="요청 취소"
          variant="secondary"
          onClick={onCancel}
          className="h-[40px] text-16-regular"
        />
      )}
    </div>
  );
}

type ApprovedPurchaseListProps = {
  requestDate: string;
  requester: string;
  isImmediateRequest?: boolean;
  product: string;
  price: number;
  approvalDate: string;
  handler: string;
  onClick: () => void;
};
export function ApprovedPurchaseList({
  requestDate,
  requester,
  isImmediateRequest,
  product,
  price,
  approvalDate,
  handler,
  onClick,
}: ApprovedPurchaseListProps) {
  return (
    <div
      onClick={onClick}
      className="w-full h-[100px] border-b border-primary-100 grid grid-cols-6 flex items-center cursor-pointer"
    >
      <div>{formatDate(requestDate)}</div>
      <div className="flex gap-[8px]">
        <p>{requester}</p>
        <Badge variant="REQUEST" message="즉시 요청" />
      </div>
      <div className="flex flex-col gap-[4px]">
        <p>{product}</p>
        <p className="text-14-regular text-primary-500">총 수량 {1}개</p>
      </div>
      <div>{price.toLocaleString()}</div>
      <div>{formatDate(approvalDate)}</div>
      <div>{handler}</div>
    </div>
  );
}
