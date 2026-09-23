import { ReactElement } from 'react';

import { StaticImageData } from 'next/image';

export type StatusVariant = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELED';

export type AuthorityVariant = 'ADMIN' | 'GENERAL';

type BaseBadgeProps = {
  icon?: StaticImageData | ReactElement;
  message: string;
  className?: string;
};

// 아무것도 지정하지 않은 경우
type DefaultBadgeProps = BaseBadgeProps & {
  type?: undefined;
  variant?: undefined;
};

// status를 사용하는 경우
type StatusBadgeProps = BaseBadgeProps & {
  type: 'STATUS';
  variant: StatusVariant;
};

// authority를 사용하는 경우
type AuthorityBadgeProps = BaseBadgeProps & {
  type: 'AUTHORITY';
  variant: AuthorityVariant;
};

// request는 type 없이 독립적으로 사용
type RequestBadgeProps = BaseBadgeProps & {
  type?: undefined;
  variant: 'REQUEST';
};

export type BadgeProps =
  | DefaultBadgeProps
  | StatusBadgeProps
  | AuthorityBadgeProps
  | RequestBadgeProps;
