import { IconProps } from './Icon.type';

export default function ExclamationIcon(props: IconProps) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      {...props}
    >
      <g>
        <path d="M12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2ZM10.8916 15.627V17.8438H13.1094V15.627H10.8916ZM10.9092 14.1562H13.0977L13.2832 6.15625H10.7168L10.9092 14.1562Z" />
      </g>
    </svg>
  );
}
