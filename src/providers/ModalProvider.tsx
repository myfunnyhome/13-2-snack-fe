'use client';

import {
  type PropsWithChildren,
  type ReactNode,
  createContext,
  useContext,
  useState,
} from 'react';

import Modal from '@/components/ui/Modal/Modal';

type ModalContextValue = {
  isOpen: boolean;
  openModal: (content: ReactNode) => void;
  closeModal: () => void;
};

const ModalContext = createContext<ModalContextValue | null>(null);

type ModalProviderProps = PropsWithChildren;

export default function ModalProvider({ children }: ModalProviderProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const [content, setContent] = useState<ReactNode>(null);

  const openModal = (modalContent: ReactNode): void => {
    setContent(modalContent);
    setIsOpen(true);
  };

  const closeModal = (): void => {
    setIsOpen(false);
    setContent(null);
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
