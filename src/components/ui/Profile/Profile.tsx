import { cn } from '@/utils/cn';

type ProfileSize = 'sm' | 'lg';

type ProfileProps = {
  name: string;
  size?: ProfileSize;
  className?: string;
};

const PROFILE_SIZE_CLASS: Record<ProfileSize, string> = {
  sm: 'h-6 w-6 text-12-bold',
  lg: 'h-12 w-12 text-16-bold',
};

function getProfileInitials(name: string): string {
  const trimmed = name.trim();

  if (!trimmed) {
    return '';
  }

  const parts = trimmed.split(/\s+/);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  return trimmed.slice(0, 2).toUpperCase();
}

export default function Profile({
  name,
  size = 'sm',
  className,
}: ProfileProps) {
  const initials = getProfileInitials(name);

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full border border-primary-200 bg-white text-black',
        PROFILE_SIZE_CLASS[size],
        className,
      )}
      aria-label={`${name} 프로필`}
    >
      {initials}
    </span>
  );
}
