import { createContext, useContext, useState } from 'react';

import Toast from '@/components/ui/Toast/Toast';
import { ToastItem } from '@/components/ui/Toast/Toast.types';

//ToastContext
type ToastContextValue = {
  open: (toast: Omit<ToastItem, 'id'>) => void;
  close: (id: number) => void;
};
const ToastContext = createContext<ToastContextValue | null>(null);

//ToastProvider
type ToastProviderProps = React.PropsWithChildren;
export default function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const open = (toast: Omit<ToastItem, 'id'>) => {
    setToasts((prev) => [
      ...prev,
      {
        id: Date.now(),
        ...toast,
      },
    ]);
  };

  const close = (id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ open, close }}>
      {children}

      <div className="w-full fixed top-4 z-50 flex flex-col gap-[10px]">
        {toasts.map((toast) => {
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
export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }

  return context;
}
