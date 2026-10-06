/*
@ 피그마 chevron
- sub category menu의 대분류 행 펼침 표시에 쓴다. down이 접힘, up이 펼침이다.
- pagination의 이전/다음 버튼에도 쓴다. left가 이전, right가 다음이다.
- src/assets/icons의 chevron svg는 fill이 black으로 고정되어 토큰 색을 적용할 수 없어
  fill만 currentColor로 바꿔 컴포넌트로 둔다. 색은 부모의 text 색을 따른다.
*/

type ChevronIconProps = {
  direction?: 'up' | 'down' | 'left' | 'right';
  className?: string;
};

const PATH_BY_DIRECTION = {
  up: 'M18.8936 13.917L12 7.02246L5.10547 13.917L6.16602 14.9775L11.999 9.14453L17.833 14.9775L18.8936 13.917Z',
  down: 'M18.8933 9.34828L11.9997 16.2428L5.10517 9.34828L6.16572 8.28773L11.9987 14.1207L17.8327 8.28773L18.8933 9.34828Z',
  left: 'M14.9165 5.37109L8.02197 12.2646L14.9165 19.1592L15.9771 18.0986L10.144 12.2656L15.9771 6.43164L14.9165 5.37109Z',
  right:
    'M9.08252 5.37109L15.9771 12.2646L9.08252 19.1592L8.02197 18.0986L13.855 12.2656L8.02197 6.43164L9.08252 5.37109Z',
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
