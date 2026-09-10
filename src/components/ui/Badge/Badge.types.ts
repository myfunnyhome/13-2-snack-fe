type StatusVariant = 'pending' | 'approved' | 'rejected' | 'canceled';

type AuthorityVariant = 'admin' | 'general';

type BaseBadgeProps = {
  icon?: string;
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
  type: 'status';
  variant: StatusVariant;
};

// authority를 사용하는 경우
type AuthorityBadgeProps = BaseBadgeProps & {
  type: 'authority';
  variant: AuthorityVariant;
};

// request는 type 없이 독립적으로 사용
type RequestBadgeProps = BaseBadgeProps & {
  type?: undefined;
  variant: 'request';
};

export type BadgeProps =
  | DefaultBadgeProps
  | StatusBadgeProps
  | AuthorityBadgeProps
  | RequestBadgeProps;
