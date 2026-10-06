import { ReactElement } from 'react';

import { StaticImageData } from 'next/image';

import rejectedIcon from '@/assets/icons/close.svg';
import canceledIcon from '@/assets/icons/delete.svg';
import pendingIcon from '@/assets/icons/time.svg';
import { CheckIcon, CloseIcon } from '@/components/icons';
import { StatusVariant } from '@/components/ui/Badge/Badge.types';

type statusBadgeMenuItemType = {
  label: StatusVariant;
  name: string;
  icon: StaticImageData | ReactElement;
};

export const statusBadgeMenu: statusBadgeMenuItemType[] = [
  { label: 'PENDING', name: '대기 중', icon: pendingIcon },
  {
    label: 'APPROVED',
    name: '승인',
    icon: <CheckIcon width="14" height="14" fill="#76CDFF" />,
  },
  {
    label: 'REJECTED',
    name: '거절',
    icon: <CloseIcon width="14" height="14" fill="#FF8484" />,
  },
  { label: 'CANCELED', name: '취소', icon: canceledIcon },
];
