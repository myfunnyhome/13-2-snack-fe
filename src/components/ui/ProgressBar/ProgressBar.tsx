import { cn } from '@/utils/cn';

type ProgressBarProps = {
  percentage: number;
  className?: string;
};

export default function ProgressBar({
  percentage,
  className,
}: ProgressBarProps) {
  const progress = Math.min(Math.max(percentage, 0), 100);

  return (
    <div className={cn('flex items-center gap-4', className)}>
      <div className="h-[10px] flex-1 overflow-hidden rounded-full bg-primary-200">
        <div
          className="h-full rounded-full bg-[#4C8AE1]"
          style={{ width: `${progress}%` }}
        />
      </div>

      <span className="text-14-regular shrink-0">{progress}%</span>
    </div>
  );
}
