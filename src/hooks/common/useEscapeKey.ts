import { useEffect } from 'react';

/*
@ ESC 키로 닫기
- isActive가 true인 동안에만 키 입력을 감지한다.
- SideMenu, Dropdown, Modal처럼 열고 닫는 상태가 있는 컴포넌트에서 쓴다.
*/
export function useEscapeKey(isActive: boolean, onEscape: () => void): void {
  useEffect(() => {
    if (!isActive) return;

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') {
        onEscape();
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive, onEscape]);
}
