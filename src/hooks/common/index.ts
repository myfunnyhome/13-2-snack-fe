/*
@ 공용 훅 — 열고 닫는 UI(사이드메뉴, 모달, 드롭다운)의 공통 동작
- 훅을 쓰는 컴포넌트 파일 맨 위에 'use client'가 있어야 한다. (서버 컴포넌트에서는 동작하지 않음)
- 훅은 조건문이나 early return(if (!isOpen) return null 등)보다 위에서 매번 같은 순서로 호출한다.

@ 사용법
import { useEscapeKey, useFocusTrap, useOutsideClick, useScrollLock } from '@/hooks/common';

// 모달·사이드메뉴처럼 화면을 덮는 UI
const panelRef = useRef<HTMLDivElement>(null);
useEscapeKey(isOpen, onClose);     // ESC로 닫기
useScrollLock(isOpen);             // 열려 있는 동안 배경 스크롤 잠금
useFocusTrap(panelRef, isOpen);    // Tab을 panelRef 안에 가두고, 닫히면 열기 버튼으로 포커스 복원
<div ref={panelRef}>...</div>

// 드롭다운처럼 Tab으로 빠져나가는 게 자연스러운 UI (useFocusTrap은 쓰지 않는다)
const dropdownRef = useRef<HTMLDivElement>(null);
useEscapeKey(isOpen, () => setIsOpen(false));
useOutsideClick(dropdownRef, isOpen, () => setIsOpen(false));

@ 주의사항
- 두 개 이상이 동시에 열리는 경우(모달 위에 모달 등)는 아직 고려하지 않았다.
  ESC 한 번에 둘 다 닫히고, 먼저 연 쪽이 먼저 닫히면 스크롤 잠금이 일찍 풀린다.
*/
export { useEscapeKey } from './useEscapeKey';
export { useFocusTrap } from './useFocusTrap';
export { useOutsideClick } from './useOutsideClick';
export { useScrollLock } from './useScrollLock';
