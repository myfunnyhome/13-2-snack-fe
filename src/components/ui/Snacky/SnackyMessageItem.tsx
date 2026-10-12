import Image from 'next/image';

import snackyIcon from '@/assets/icons/snacky.svg';

export type SnackyMessage = {
  role: 'user' | 'snacky';
  text: string;
};

export default function SnackyMessageItem({ role, text }: SnackyMessage) {
  if (role === 'user') {
    return (
      <div className="flex justify-end">
        <p className="max-w-[290px] rounded-[8px] bg-primary-50 px-[14px] py-[10px] text-[15px] leading-6 break-words break-keep whitespace-pre-wrap text-primary-950">
          {text}
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-[10px]">
      <Image src={snackyIcon} alt="" width={28} height={28} />
      <div className="flex max-w-[290px] min-w-0 flex-col gap-1">
        <p className="text-12-regular text-primary-400">Snacky</p>
        <p className="text-[15px] leading-6 break-words break-keep whitespace-pre-line text-primary-950">
          {text}
        </p>
      </div>
    </div>
  );
}
