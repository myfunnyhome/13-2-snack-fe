// 사용법:
// <ProductImage src={이미지경로} alt="설명" size={200} />
// size: 정사각형 한 변 픽셀값 (필수) / background: 배경 클래스, 기본 투명 (선택) / className: 추가 클래스 (선택)
// 이미지는 원본 비율 유지, 크롭 없이 표시됨
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
