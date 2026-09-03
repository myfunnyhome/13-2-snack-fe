import Image from 'next/image';

import { cn } from '@/utils/cn';

const PADDING_RATIO = 96 / 540;

interface ProductImageProps {
  src: string;
  alt: string;
  size: number;
  background?: string;
  className?: string;
}

export default function ProductImage({
  src,
  alt,
  size,
  background,
  className,
}: ProductImageProps) {
  const innerSize = size - size * PADDING_RATIO * 2;

  return (
    <div
      className={cn(
        'relative flex shrink-0 items-center justify-center',
        background,
        className,
      )}
      style={{ width: size, height: size }}
    >
      <div className="relative" style={{ width: innerSize, height: innerSize }}>
        <Image
          src={src}
          alt={alt}
          fill
          sizes={`${innerSize}px`}
          className="object-contain"
        />
      </div>
    </div>
  );
}
