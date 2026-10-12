import Image from 'next/image';

import snackyIcon from '@/assets/icons/snacky.svg';

export const SNACKY_GREETING =
  '안녕하세요, AI 어시스턴트 Snacky입니다.\n무엇을 도와드릴까요?';

type SnackyIntroProps = {
  description?: string;
};

export default function SnackyIntro({ description }: SnackyIntroProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 px-5 py-6 text-center">
      <Image src={snackyIcon} alt="" width={88} height={88} />
      <p className="text-18-bold leading-[28px] whitespace-pre-line text-primary-950">
        {SNACKY_GREETING}
      </p>
      {description ? (
        <p className="text-14-regular text-primary-400">{description}</p>
      ) : null}
    </div>
  );
}
