import { useEffect } from 'react';

/*
@ 배경 스크롤 잠금
- isActive가 true인 동안 body 스크롤을 막고, false가 되면 원래 값으로 되돌린다.
- 무조건 ''로 되돌리지 않고 원래 값을 저장해두는 이유는
  다른 곳에서 이미 overflow를 바꿔뒀을 수 있기 때문이다.
*/
export function useScrollLock(isActive: boolean): void {
  useEffect(() => {
    if (!isActive) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isActive]);
}
