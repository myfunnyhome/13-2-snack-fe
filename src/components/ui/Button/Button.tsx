'use client';
import { cn } from '@/utils/cn';

type ButtonProps = {
  text: string;
  type?: 'button' | 'submit';
  disabled?: boolean;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  className?: string;
};

const buttonVariant = {
  primary: 'bg-primary-950 text-white',
  secondary: 'bg-white text-primary-950 border border-primary-300',
};

export default function Button({
  text,
  type = 'button',
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
        disabled && 'bg-primary-100 text-primary-300',
        className,
      )}
    >
      {text}
    </button>
  );
}
