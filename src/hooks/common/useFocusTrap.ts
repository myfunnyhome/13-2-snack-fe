import { type RefObject, useEffect } from 'react';

// SideMenu 원본은 링크와 버튼만 셌다. 입력칸이 있는 모달에서는
// 첫 칸이나 마지막 칸을 놓쳐 포커스가 밖으로 새므로 폼 요소까지 포함한다.
// type="hidden" 입력칸은 포커스를 받을 수 없어 제외한다.
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

// 반응형 클래스(hidden md:flex 등)로 화면에서 숨긴 요소는 focus()가 먹지 않는다.
// 이런 요소가 첫 번째나 마지막으로 잡히면 돌려보내기가 실패하므로 목록에서 뺀다.
function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  ).filter((element) => element.getClientRects().length > 0);
}

/*
@ 포커스 가두기
- 활성화되면 컨테이너 안의 첫 요소로 포커스를 옮긴다.
- Tab과 Shift+Tab이 컨테이너 밖으로 나가지 않게 양 끝에서 반대편으로 돌린다.
- 비활성화되면 활성화 직전에 포커스가 있던 요소(보통 열기 버튼)로 되돌린다.
@ 주의사항
- 드롭다운처럼 Tab으로 빠져나가는 게 자연스러운 곳에는 쓰지 않는다.
- 의존성은 containerRef와 isActive만 둔다. 다른 값 때문에 다시 실행되면
  cleanup의 되돌리기 포커스가 열려 있는 도중에 불린다.
*/
export function useFocusTrap<T extends HTMLElement>(
  containerRef: RefObject<T | null>,
  isActive: boolean,
): void {
  useEffect(() => {
    const container = containerRef.current;
    if (!isActive || !container) return;

    const trigger =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    getFocusableElements(container)[0]?.focus();

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key !== 'Tab' || !container) return;

      const focusables = getFocusableElements(container);
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const isOutside = !container.contains(document.activeElement);

      if (event.shiftKey && (isOutside || document.activeElement === first)) {
        event.preventDefault();
        last.focus();
        return;
      }

      if (!event.shiftKey && (isOutside || document.activeElement === last)) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      trigger?.focus();
    };
  }, [containerRef, isActive]);
}
