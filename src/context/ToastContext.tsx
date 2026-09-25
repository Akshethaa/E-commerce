import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { CheckCircle2, X, AlertCircle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

type Toast = {
  id: string;
  message: string;
  type: ToastType;
};

type ToastContextValue = {
  showToast: (message: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const dismiss = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-lg ring-1 ring-gray-200 animate-slide-up min-w-[280px] max-w-sm"
          >
            {toast.type === 'success' && (
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
            )}
            {toast.type === 'error' && (
              <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
            )}
            {toast.type === 'info' && (
              <Info className="h-5 w-5 shrink-0 text-blue-500" />
            )}
            <p className="flex-1 text-sm font-medium text-gray-800">
              {toast.message}
            </p>
            <button
              onClick={() => dismiss(toast.id)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
