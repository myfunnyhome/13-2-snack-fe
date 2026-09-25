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

type PurchaseListManagementItemProps = {
  date: string;
  product: string;
  price: number;
  profile: string;
  remarks: ReactNode;
  onClick: () => void;
};

export function PurchaseManagementListItemMobile({
  date,
  product,
  price,
  profile,
  remarks,
  onClick,
}: PurchaseListManagementItemProps) {
  return (
    <div
      onClick={onClick}
      className="w-full border-b border-primary-100 py-[30px] cursor-pointer"
    >
      <div className="flex justify-between items-center mb-[10px]">
        <p className="text-14-bold">{formatDate(date)}</p>
        <div className="flex items-center gap-[12px]">
          <Profile name={profile} className="bg-primary-50" />
          <p>{profile}</p>
        </div>
      </div>
      <p>{product}</p>
      <p className="text-20-bold mt-[8px] mb-[20px]">
        {price.toLocaleString()}원
      </p>
      {remarks}
    </div>
  );
}
export function PurchaseManagementListItem({
  date,
  product,
  price,
  profile,
  remarks,
  onClick,
}: PurchaseListManagementItemProps) {
  return (
    <div
      onClick={onClick}
      className="w-full h-[100px] border-b border-primary-100 grid grid-cols-5 flex items-center cursor-pointer"
    >
      <div>{formatDate(date)}</div>
      <div>{product}</div>
      <div>{price.toLocaleString()}</div>
      <div className="flex items-center gap-[12px]">
        <Profile name={profile} className="bg-primary-50" />
        <p>{profile}</p>
      </div>
      {remarks}
    </div>
  );
}
