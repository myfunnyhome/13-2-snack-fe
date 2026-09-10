'use client';
import checkIcon from '@/assets/icons/check.svg';
import exclamationIcon from '@/assets/icons/exclamation.svg';
import { useToast } from '@/providers/ToastProvider';

export default function Home() {
  const { open, close } = useToast('bottom');
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <button
          type="button"
          className="w-30 h-15 rounded-2xl bg-primary-900 text-white"
          onClick={() => {
            open({
              icon: exclamationIcon,
              text: '예산이 부족합니다. 수량을 줄이거나 항목을 제거해주세요.',
              secondaryText: '남은 예산 20,000원',
              className: 'bg-red-500',
            });
            setTimeout(() => {
              open({
                icon: checkIcon,
                text: '예산이 변경되었습니다.',
                className: 'bg-red-500',
              });
            }, 3000);
          }}
        >
          테스트버튼
        </button>
      </main>
    </div>
  );
}
