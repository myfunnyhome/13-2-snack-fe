export type ToastItem = {
  id: number;
  text: string;
  secondaryText?: string;
  icon?: string;
  position?: 'top' | 'bottom';
  className?: string;
};
