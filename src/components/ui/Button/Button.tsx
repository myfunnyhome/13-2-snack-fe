import { cn } from '@/utils/cn';

interface ButtonProps {
  text: string;
  type?: 'button' | 'submit';
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'disabled';
  className?: string;
}

const buttonVariant = {
  primary: 'bg-primary-950 text-white',
  secondary: 'bg-white text-primary-950 border border-primary-300',
  disabled: 'bg-primary-100 text-primary-300',
};

export default function Button({
  text,
  type = 'button',
  onClick,
  variant = 'primary',
  className,
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={cn(
        'w-full h-[64px] rounded-[2px] flex items-center justify-center cursor-pointer',
        buttonVariant[variant],
        className,
      )}
    >
      {text}
    </button>
  );
}
