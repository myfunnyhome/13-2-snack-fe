type PlusMinusIconProps = {
  isMinus?: boolean;
  className?: string;
};

export default function PlusMinusIcon({
  isMinus = false,
  className,
}: PlusMinusIconProps) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      {!isMinus && <path d="M11.25 21V3H12.75V21H11.25Z" fill="currentColor" />}
      <path d="M3 11.25H21V12.75H3V11.25Z" fill="currentColor" />
    </svg>
  );
}
