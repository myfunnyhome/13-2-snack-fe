/*
@ 피그마 chevron
- sub category menu의 대분류 행 펼침 표시에 쓴다. down이 접힘, up이 펼침이다.
- src/assets/icons의 chevron svg는 fill이 black으로 고정되어 토큰 색을 적용할 수 없어
  fill만 currentColor로 바꿔 컴포넌트로 둔다. 색은 부모의 text 색을 따른다.
*/

type ChevronIconProps = {
  direction?: 'up' | 'down';
  className?: string;
};

const PATH_BY_DIRECTION = {
  up: 'M18.8936 13.917L12 7.02246L5.10547 13.917L6.16602 14.9775L11.999 9.14453L17.833 14.9775L18.8936 13.917Z',
  down: 'M18.8933 9.34828L11.9997 16.2428L5.10517 9.34828L6.16572 8.28773L11.9987 14.1207L17.8327 8.28773L18.8933 9.34828Z',
};

export default function ChevronIcon({
  direction = 'down',
  className,
}: ChevronIconProps) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <path d={PATH_BY_DIRECTION[direction]} fill="currentColor" />
    </svg>
  );
}
