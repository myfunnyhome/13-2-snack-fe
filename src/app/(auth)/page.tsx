import Image, { getImageProps } from 'next/image';
import Link from 'next/link';

import arrowRightIcon from '@/assets/icons/arrow_right.svg';
import landingMobile from '@/assets/images/landing_mo.png';
import landingDesktop from '@/assets/images/landing_pc.png';
import landingTablet from '@/assets/images/landing_tb.png';
import { cn } from '@/utils/cn';

const FEATURE_MESSAGES = [
  '흩어진 간식 구매처를 통합하고,\n기수별 지출을 똑똑하게 관리하세요.',
  '관리자와 유저\n모두 이용할 수 있어요.',
  '다양한 품목도\n한 눈에 파악해봐요.',
  '쉽고 빠르게\n구매를 요청해보세요.',
  '여러 플랫폼에서 구매한 간식 내역을\n한 곳에서 쉽게 관리해요',
];

const MARQUEE_MESSAGES = [...FEATURE_MESSAGES, ...FEATURE_MESSAGES];

const PREVIEW_ALT = 'Snack 상품 리스트 화면 미리보기';

const { props: PREVIEW_DESKTOP } = getImageProps({
  src: landingDesktop,
  alt: PREVIEW_ALT,
});
const { props: PREVIEW_TABLET } = getImageProps({
  src: landingTablet,
  alt: PREVIEW_ALT,
});
const { props: PREVIEW_MOBILE } = getImageProps({
  src: landingMobile,
  alt: PREVIEW_ALT,
  loading: 'eager',
  fetchPriority: 'high',
});

export default function Page() {
  return (
    <div className="relative h-[calc(100dvh-76px)] overflow-hidden md:h-[calc(100dvh-100px)] lg:h-[calc(100dvh-108px)]">
      <section className="animate-fade-in-top flex flex-col items-center px-6 pt-16 md:pt-[70px] lg:pt-[81px]">
        <h1 className="text-center text-20-extrabold text-primary-950 md:text-32-extrabold lg:text-[50px] lg:leading-[1.4]">
          내가 원하는 간식을 쉽고 빠르게 구매
        </h1>

        <p className="mt-3 text-16-bold text-[#b2b2b2] md:text-20-bold lg:mt-3.5 lg:text-24-bold">
          with Snack
        </p>

        <Link
          href="/signup"
          className="mt-7.5 inline-flex h-10 items-center gap-1 rounded-full bg-primary-950 px-4 text-14-bold text-white md:mt-10 md:h-11 md:px-5 md:text-16-bold lg:mt-7.5"
        >
          Sign Now
          <Image
            src={arrowRightIcon}
            alt=""
            width={20}
            height={20}
            className="size-4 invert md:size-5"
          />
        </Link>
      </section>

      <figure className="mt-[46px] flex justify-center px-6 md:mt-[70px] lg:mt-16 lg:px-[100px]">
        <picture className="w-full max-w-[300px] md:max-w-[530px] lg:max-w-[1300px]">
          <source
            media="(min-width: 1440px)"
            srcSet={PREVIEW_DESKTOP.srcSet}
            width={PREVIEW_DESKTOP.width}
            height={PREVIEW_DESKTOP.height}
          />
          <source
            media="(min-width: 744px)"
            srcSet={PREVIEW_TABLET.srcSet}
            width={PREVIEW_TABLET.width}
            height={PREVIEW_TABLET.height}
          />
          <img
            {...PREVIEW_MOBILE}
            alt={PREVIEW_ALT}
            className="h-auto w-full"
          />
        </picture>
      </figure>

      <section className="pointer-events-none absolute inset-x-0 bottom-0 overflow-hidden pb-[42px] md:pb-16 lg:pb-[50px]">
        <h2 className="sr-only">주요 기능</h2>
        <div className="animate-marquee flex w-max items-stretch gap-3 md:gap-5 lg:gap-10">
          {MARQUEE_MESSAGES.map((message, index) => (
            <p
              key={`${message}-${index}`}
              aria-hidden={index >= FEATURE_MESSAGES.length ? true : undefined}
              className={cn(
                'shrink-0 rounded-[8px] border border-[#e4e4e4] bg-white/40 px-6 py-5 text-12-regular',
                'md:px-[30px] md:py-6 md:text-13-regular lg:p-[30px] lg:text-16-regular-lead',
                'whitespace-pre-line text-[#808080] backdrop-blur-[20px]',
                'shadow-[0px_7px_20px_rgba(0,0,0,0.02)]',
              )}
            >
              {message}
            </p>
          ))}
        </div>
      </section>
    </div>
  );
}
