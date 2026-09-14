export type ToastItem = {
  id: string;
  text: string;
  secondaryText?: string;
  icon?: string;
  position?: 'top' | 'bottom';
  className?: string;
};
