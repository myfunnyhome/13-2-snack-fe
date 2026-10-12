'use client';

import { useState } from 'react';

import Image from 'next/image';

import snackyIcon from '@/assets/icons/snacky.svg';
import snackyLauncherIcon from '@/assets/icons/snacky_launcher.svg';
import { XIcon } from '@/components/icons';
import { useAuth } from '@/providers/AuthProvider';
import { cn } from '@/utils/cn';

import SnackyChat from './SnackyChat';
import SnackyIntro from './SnackyIntro';

export default function SnackyLauncher() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <>
      {isOpen ? null : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed right-6 bottom-24 z-40 flex flex-col items-end gap-3"
        >
          <span className="relative size-16 motion-safe:animate-float">
            <Image
              src={snackyLauncherIcon}
              alt=""
              width={104}
              height={104}
              className="absolute -top-3 -left-5 max-w-none"
            />
          </span>
        </button>
      )}

      <section
        role="dialog"
        aria-label="Snacky 채팅"
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            setIsOpen(false);
          }
        }}
        className={cn(
          'fixed right-6 bottom-24 z-50 h-[680px] max-h-[calc(100dvh-120px)] w-[400px] max-w-[calc(100vw-48px)] flex-col overflow-hidden rounded-[12px] border border-primary-100 bg-white shadow-[0px_12px_40px_0px_rgba(0,0,0,0.12)]',
          isOpen ? 'flex' : 'hidden',
        )}
      >
        <header className="flex items-center gap-[10px] border-b border-primary-100 py-[14px] pr-4 pl-5">
          <Image src={snackyIcon} alt="" width={32} height={32} />
          <div className="flex min-w-0 flex-1 flex-col">
            <p className="text-16-bold leading-5 text-primary-950">Snacky</p>
            <p className="text-12-regular leading-[14px] text-primary-400">
              AI 어시스턴트
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Snacky 닫기"
          >
            <XIcon className="text-primary-950" />
          </button>
        </header>

        {user ? (
          <SnackyChat key={user.email} />
        ) : (
          <SnackyIntro description="기업 회원은 로그인이 필요합니다." />
        )}
      </section>
    </>
  );
}
