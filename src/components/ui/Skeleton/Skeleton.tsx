import type { HTMLAttributes } from 'react';

type SkeletonProps = HTMLAttributes<HTMLDivElement>;

export default function Skeleton({ className = '', ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={`relative w-full overflow-hidden rounded bg-gray-200 ${className}`}
      {...props}
    >
      <div
        className="absolute inset-0 -translate-x-full animate-skeleton-shimmer
          bg-[linear-gradient(110deg,transparent_25%,rgba(255,255,255,0.7)_50%,transparent_75%)]"
      />
    </div>
  );
}
