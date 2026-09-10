'use client';
import { cn } from '@/utils/cn';

type ButtonProps = {
  text: string;
  type?: 'button' | 'submit';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  className?: string;
};

const buttonVariant = {
  primary: 'bg-primary-950 text-white',
  secondary: 'bg-white text-primary-950 border border-primary-300',
};
const buttonSize = {
  sm: 'h-[40px]',
  md: 'h-[44px]',
  lg: 'h-[64px]',
};

export default function Button({
  text,
  type = 'button',
  size = 'lg',
  disabled = false,
  onClick,
  variant = 'primary',
  className,
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'w-full h-[64px] rounded-[2px] flex items-center justify-center text-16-bold',
        buttonVariant[variant],
        buttonSize[size],
        disabled && 'bg-primary-100 text-primary-300 border-0',
        className,
      )}
    >
      {text}
    </button>
  );
}
