'use client';

import {
  type PropsWithChildren,
  type ReactNode,
  createContext,
  useContext,
  useRef,
  useState,
} from 'react';

import Modal from '@/components/ui/Modal/Modal';

type OpenModalOptions = {
  // 모달을 연 요소가 닫힐 때 사라져 있으면 대신 포커스할 요소
  fallbackFocus?: () => HTMLElement | null;
};

type ModalContextValue = {
  isOpen: boolean;
  openModal: (content: ReactNode, options?: OpenModalOptions) => void;
  closeModal: () => void;
};

const ModalContext = createContext<ModalContextValue | null>(null);

type ModalProviderProps = PropsWithChildren;

function getRestoreTarget(
  invoker: HTMLElement | null,
  fallbackFocus: OpenModalOptions['fallbackFocus'],
): HTMLElement | null {
  if (invoker && invoker !== document.body && invoker.isConnected) {
    return invoker;
  }

  return fallbackFocus?.() ?? null;
}

export default function ModalProvider({ children }: ModalProviderProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const [content, setContent] = useState<ReactNode>(null);

  const invokerRef = useRef<HTMLElement | null>(null);
  const fallbackFocusRef = useRef<OpenModalOptions['fallbackFocus']>(undefined);

  const openModal = (
    modalContent: ReactNode,
    options?: OpenModalOptions,
  ): void => {
    if (!invokerRef.current && document.activeElement instanceof HTMLElement) {
      invokerRef.current = document.activeElement;
    }

    if (options?.fallbackFocus) {
      fallbackFocusRef.current = options.fallbackFocus;
    }

    setContent(modalContent);
    setIsOpen(true);
  };

  const closeModal = (): void => {
    const restoreTarget = getRestoreTarget(
      invokerRef.current,
      fallbackFocusRef.current,
    );

    invokerRef.current = null;
    fallbackFocusRef.current = undefined;

    setIsOpen(false);
    setContent(null);

    restoreTarget?.focus();
  };

  const contextValue: ModalContextValue = {
    isOpen,
    openModal,
    closeModal,
  };

  return (
    <ModalContext.Provider value={contextValue}>
      {children}

      <Modal isOpen={isOpen} onClose={closeModal}>
        {content}
      </Modal>
    </ModalContext.Provider>
  );
}

export function useModal(): ModalContextValue {
  const context = useContext<ModalContextValue | null>(ModalContext);

  if (!context) {
    throw new Error('useModal은 ModalProvider 안에서 사용해야 합니다.');
  }

  return context;
}
