import { createContext, useContext, useState } from 'react';

import Toast from '@/components/ui/Toast/Toast';
import { ToastItem } from '@/components/ui/Toast/Toast.types';

type ToastPosition = 'top' | 'bottom';

//ToastContext
type ToastContextValue = {
  open: (toast: Omit<ToastItem, 'id'>, position: ToastPosition) => void;
  close: (id: number) => void;
};
const ToastContext = createContext<ToastContextValue | null>(null);

//ToastProvider
type ToastProviderProps = React.PropsWithChildren;
export default function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const open = (toast: Omit<ToastItem, 'id'>, position: ToastPosition) => {
    setToasts((prev) => [
      ...prev,
      {
        id: Date.now(),
        ...toast,
        position,
      },
    ]);
  };

  const close = (id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ open, close }}>
      {children}

      {/**@상단에 나타나는 토스트 */}
      <div className="w-full fixed top-4 z-50 flex flex-col gap-[10px]">
        {toasts
          .filter((toast) => toast.position === 'top')
          .map((toast) => {
            const { id, className, ...toastProps } = toast;
            return (
              <Toast
                key={id}
                id={id}
                {...toastProps}
                onClose={close}
                className={className}
              />
            );
          })}
      </div>

      {/**@하단에 나타나는 토스트 */}
      <div className="w-full fixed bottom-4 z-50 flex flex-col gap-[10px]">
        {toasts
          .filter((toast) => toast.position === 'bottom')
          .map((toast) => {
            const { id, className, ...toastProps } = toast;
            return (
              <Toast
                key={id}
                id={id}
                {...toastProps}
                onClose={close}
                className={className}
              />
            );
          })}
      </div>
    </ToastContext.Provider>
  );
}

//useToast (사용할 시)
//훅의 인자로 토스트의 위치 정보 받음 ('top' | 'bottom')
//open 함수를 통해서 토스트의 위치 정보 넘겨줌
type ToastActions = {
  open: (toast: Omit<ToastItem, 'id'>) => void;
  close: (id: number) => void;
};
export function useToast(position: ToastPosition = 'top'): ToastActions {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }

  return {
    open: (toast: Omit<ToastItem, 'id'>) => {
      context.open(toast, position);
    },
    close: context.close,
  };
}
