type StatusVariant = 'pending' | 'approved' | 'rejected';

type AuthorityVariant = 'admin' | 'general';

interface BaseBadgeProps {
  icon?: string;
  message: string;
  className?: string;
}

// 아무것도 지정하지 않은 경우
interface DefaultBadgeProps extends BaseBadgeProps {
  type?: undefined;
  variant?: undefined;
}

// status를 사용하는 경우
interface StatusBadgeProps extends BaseBadgeProps {
  type: 'status';
  variant: StatusVariant;
}

// authority를 사용하는 경우
interface AuthorityBadgeProps extends BaseBadgeProps {
  type: 'authority';
  variant: AuthorityVariant;
}

// request는 type 없이 독립적으로 사용
interface RequestBadgeProps extends BaseBadgeProps {
  type?: undefined;
  variant: 'request';
}

export type BadgeProps =
  | DefaultBadgeProps
  | StatusBadgeProps
  | AuthorityBadgeProps
  | RequestBadgeProps;
