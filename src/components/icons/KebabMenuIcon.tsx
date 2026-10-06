type KebabMenuIconProps = {
  className?: string;
};

export default function KebabMenuIcon({ className }: KebabMenuIconProps) {
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
      <rect x="11" y="5" width="2" height="2" fill="currentColor" />
      <rect x="11" y="11" width="2" height="2" fill="currentColor" />
      <rect x="11" y="17" width="2" height="2" fill="currentColor" />
    </svg>
  );
}
