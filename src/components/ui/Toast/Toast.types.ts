import type { ReactElement } from 'react';

import type { StaticImageData } from 'next/image';

export type ToastItem = {
  id: string;
  text: string;
  secondaryText?: string;
  icon?: StaticImageData | ReactElement;
  position?: 'top' | 'bottom';
  className?: string;
};
