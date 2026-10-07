"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { CheckCircle } from "lucide-react";
import type { ReactNode } from "react";

type Toast = { id: number; message: string };

type ToastFn = (message: string) => void;

type ToastContextValue = {
  toasts: Toast[];
  push: ToastFn;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  const push: ToastFn = useCallback((message: string) => {
    const id = nextId.current++;
    setToasts((prev) => [...prev, { id, message }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, push }}>
      {children}
      <Toaster />
    </ToastContext.Provider>
  );
}

export function useToast(): ToastFn {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx.push;
}

export function Toaster() {
  const ctx = useContext(ToastContext);
  const toasts = ctx?.toasts ?? [];
  if (toasts.length === 0) return null;

  return (
    <div aria-live="polite" className="fixed bottom-4 right-4 z-[100] flex flex-col items-end gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="flex items-center gap-2 bg-espresso text-ivory rounded-lg px-4 py-3 shadow-lg animate-fade-up max-w-xs"
        >
          <CheckCircle className="h-5 w-5 shrink-0 text-gold" aria-hidden="true" />
          <p className="text-sm">{toast.message}</p>
        </div>
      ))}
    </div>
  );
}
