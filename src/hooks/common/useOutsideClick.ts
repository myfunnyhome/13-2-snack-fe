import { type RefObject, useEffect } from 'react';

/*
@ 바깥 클릭으로 닫기
- ref로 받은 요소의 바깥을 누르면 onOutsideClick을 호출한다.
- 기존 Dropdown과 동작을 똑같이 맞추려고 click 대신 mousedown을 그대로 쓴다.
*/
export function useOutsideClick<T extends HTMLElement>(
  ref: RefObject<T | null>,
  isActive: boolean,
  onOutsideClick: () => void,
): void {
  useEffect(() => {
    if (!isActive) return;

    function handleMouseDown(event: MouseEvent): void {
      // event.target은 EventTarget 타입이라 contains()에 넣기 전에 Node인지 확인한다.
      if (!(event.target instanceof Node)) return;

      if (ref.current && !ref.current.contains(event.target)) {
        onOutsideClick();
      }
    }

    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [ref, isActive, onOutsideClick]);
}
