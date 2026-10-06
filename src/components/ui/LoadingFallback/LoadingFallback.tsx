import Fallback from '@/components/ui/Fallback/Fallback';

function Spinner() {
  return (
    <div
      role="status"
      aria-label="로딩 중"
      className="size-[70px] animate-spin rounded-full border-4 border-primary-100 border-t-primary-950"
    />
  );
}

type LoadingFallbackProps = {
  className?: string;
};

export default function LoadingFallback({ className }: LoadingFallbackProps) {
  return (
    <Fallback
      icon={<Spinner />}
      title="불러오는 중이에요"
      description="잠시만 기다려주세요"
      className={className}
    />
  );
}
