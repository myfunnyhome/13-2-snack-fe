/*
@ 피그마 ic/X (원형 배경 없음)
- side menu 우상단 닫기 버튼에 쓴다.
- src/assets/icons/close.svg 는 원형 배경이 있는 다른 아이콘이라 따로 둔다.
- stroke가 currentColor라 부모의 text 색을 따른다.
*/

type XIconProps = {
  className?: string;
};

export default function XIcon({ className }: XIconProps) {
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
      <path
        d="M5 5L19 19"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M19 5L5 19"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
