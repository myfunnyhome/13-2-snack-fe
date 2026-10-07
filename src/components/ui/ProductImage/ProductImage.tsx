// 사용법:
// <ProductImage src={이미지경로} alt="설명" size={200} />
// size: 정사각형 한 변 픽셀값 (필수) / background: 배경 클래스, 기본 투명 (선택) / className: 추가 클래스 (선택)
// 이미지는 원본 비율 유지, 크롭 없이 표시됨
import Image from 'next/image';

import { cn } from '@/utils/cn';

const PADDING_RATIO = 96 / 540;

// 우리 이미지 API(/api/images/...)는 로그인 쿠키가 필요하다.
// next/image 최적화는 Next 서버가 대신 요청해서 쿠키가 실리지 않으므로,
// 이 주소만 최적화를 끄고 브라우저가 직접 받게 한다. 프로젝트 안의 정적 이미지는 그대로 최적화한다.
const API_IMAGE_PREFIX = '/api/';

type ProductImageProps = {
  src: string;
  alt: string;
  size: number;
  background?: string;
  className?: string;
  hasMaxWidth?: boolean;
  /**
   * 첫 화면에 바로 보이는 이미지에만 준다.
   * next/image는 기본이 lazy라 화면에 이미 보이는 이미지도 뒤늦게 받아 LCP가 밀린다.
   * 화면 밖 이미지에 주면 오히려 대역폭을 뺏으니 상단 몇 장에만 쓴다.
   */
  priority?: boolean;
};

export default function ProductImage({
  src,
  alt,
  size,
  background,
  className,
  hasMaxWidth = true,
  priority = false,
}: ProductImageProps) {
  const innerSize = size - size * PADDING_RATIO * 2;

  return (
    <div
      className={cn(
        'w-full relative flex shrink-0 items-center justify-center',
        background,
        className,
      )}
      style={{
        aspectRatio: '1 / 1',
        ...(hasMaxWidth ? { maxWidth: size } : {}),
      }}
    >
      <div
        className="relative aspect-square"
        style={{ width: `${(innerSize / size) * 100}%` }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes={`(max-width: ${size}px) ${Math.round((innerSize / size) * 100)}vw, ${innerSize}px`}
          unoptimized={src.startsWith(API_IMAGE_PREFIX)}
          priority={priority}
          className="object-contain"
        />
      </div>
    </div>
  );
}
