import type { FormEventHandler, PropsWithChildren } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import logo from '@/assets/images/logo.png';
import Button from '@/components/ui/Button/Button';
import { cn } from '@/utils/cn';

type AuthFormCardProps = PropsWithChildren<{
  onSubmit: FormEventHandler<HTMLFormElement>;
  isSubmitDisabled: boolean;
  isSubmitting: boolean;
  errorMessage: string;
  submitText?: string;
  submittingText?: string;
}>;

export default function AuthFormCard({
  onSubmit,
  isSubmitDisabled,
  isSubmitting,
  errorMessage,
  submitText = '가입하기',
  submittingText = '가입 중...',
  children,
}: AuthFormCardProps) {
  return (
    <div className="flex min-h-[calc(100dvh-76px)] flex-col items-center justify-center gap-10 px-6 py-14 md:min-h-[calc(100dvh-100px)] lg:min-h-[calc(100dvh-108px)]">
      <Image
        src={logo}
        alt="Snack"
        width={206}
        height={88}
        className="h-12 w-auto md:h-16 lg:h-[88px]"
        priority
      />

      <form
        onSubmit={onSubmit}
        className="flex w-full max-w-[600px] flex-col bg-white md:rounded-xs md:px-[60px] md:py-10 md:drop-shadow-[0px_0px_20px_rgba(0,0,0,0.1)]"
      >
        {children}

        <p
          role="alert"
          className={cn('text-error text-[12px]', errorMessage && 'mt-4')}
        >
          {errorMessage}
        </p>

        <Button
          type="submit"
          text={isSubmitting ? submittingText : submitText}
          disabled={isSubmitDisabled}
          className="mt-7.5"
        />

        <div className="mt-6 flex justify-center gap-1 text-16-regular text-[#999999]">
          <span>이미 계정이 있으신가요?</span>
          <Link
            href="/signin"
            className="text-16-bold text-primary-950 underline"
          >
            로그인
          </Link>
        </div>
      </form>
    </div>
  );
}
