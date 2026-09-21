import Image from 'next/image';
import Link from 'next/link';

import landingMobile from '@/assets/images/landing_mo.png';
import landingDesktop from '@/assets/images/landing_pc.png';
import landingTablet from '@/assets/images/landing_tb.png';
import { cn } from '@/utils/cn';

// 전체 코드 AI로 작업이 되어서 리팩터링 예정입니다. 우선 1차 초안만 생성 했어요

const FEATURE_MESSAGES = [
  '흩어진 간식 구매처를 통합하고,\n기수별 지출을 똑똑하게 관리하세요.',
  '관리자와 유저\n모두 이용할 수 있어요.',
  '다양한 품목도\n한 눈에 파악해봐요.',
  '쉽고 빠르게\n구매를 요청해보세요.',
  '여러 플랫폼에서 구매한 간식 내역을\n한 곳에서 쉽게 관리해요',
];

const MARQUEE_MESSAGES = [...FEATURE_MESSAGES, ...FEATURE_MESSAGES];

// checkAuth()/redirect()와 Gnb는 (auth)/layout.tsx가 공통으로 처리함 — 여기서 중복 호출 안 함
export default function Page() {
  return (
    <div className="relative h-[calc(100dvh-76px)] overflow-hidden md:h-[calc(100dvh-100px)] lg:h-[calc(100dvh-108px)]">
      <section className="animate-fade-in-top flex flex-col items-center px-6 pt-16 md:pt-20 lg:pt-[120px]">
        <h1 className="text-center text-[28px] font-bold text-primary-950 md:text-[40px] lg:text-[56px]">
          내가 원하는 간식을 쉽고 빠르게 구매
        </h1>

        <p className="text-16-regular mt-4 text-primary-400 md:mt-5 md:text-[20px]">
          with Snack
        </p>

        <Link
          href="/signup"
          className="text-16-bold mt-8 inline-flex items-center gap-2 rounded-full bg-primary-950 px-8 py-4 text-white md:mt-10"
        >
          Sign Now
          <span aria-hidden>→</span>
        </Link>
      </section>

      <div className="mt-12 flex justify-center px-6 md:mt-16 lg:mt-20 lg:px-[100px]">
        <Image
          src={landingMobile}
          alt="Snack 상품 리스트 화면 미리보기"
          className="h-auto w-full max-w-[1300px] md:hidden"
          priority
        />
        <Image
          src={landingTablet}
          alt="Snack 상품 리스트 화면 미리보기"
          className="hidden h-auto w-full max-w-[1300px] md:block lg:hidden"
          priority
        />
        <Image
          src={landingDesktop}
          alt="Snack 상품 리스트 화면 미리보기"
          className="hidden h-auto w-full max-w-[1300px] lg:block"
          priority
        />
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 overflow-hidden pb-6 md:pb-10">
        <div className="animate-marquee flex w-max items-stretch gap-3 md:gap-4">
          {MARQUEE_MESSAGES.map((message, index) => (
            <p
              key={`${message}-${index}`}
              className={cn(
                'text-14-regular-lead flex h-[76px] w-[240px] shrink-0 items-center rounded-xs bg-white/90 px-5 whitespace-pre-line text-primary-700',
                'shadow-[0_4px_16px_rgba(0,0,0,0.06)] md:h-[88px] md:w-[280px] md:px-6',
              )}
            >
              {message}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
