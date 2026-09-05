"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Notification Container positioned at top-right */}
      <div
        aria-live="polite"
        className="fixed top-4 right-4 left-4 sm:left-auto sm:top-5 sm:right-5 z-[999999] flex flex-col gap-3 max-w-sm w-auto sm:w-full pointer-events-none"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="alert"
            className={`pointer-events-auto flex items-center justify-between p-4 rounded-2xl shadow-2xl border transition-all duration-300 transform translate-y-0 ${
              toast.type === "success"
                ? "bg-slate-900 border-emerald-500 text-emerald-100 shadow-emerald-950/50"
                : toast.type === "error"
                ? "bg-slate-900 border-rose-500 text-rose-100 shadow-rose-950/50"
                : toast.type === "warning"
                ? "bg-slate-900 border-amber-500 text-amber-100 shadow-amber-950/50"
                : "bg-slate-900 border-slate-700 text-white"
            }`}
          >
            <div className="flex items-center gap-3 pr-2">
              {toast.type === "success" && (
                <div className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              )}
              {toast.type === "error" && (
                <div className="p-1.5 rounded-xl bg-rose-500/20 text-rose-400 shrink-0">
                  <AlertCircle className="w-5 h-5" />
                </div>
              )}
              {toast.type === "warning" && (
                <div className="p-1.5 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              )}
              {toast.type === "info" && (
                <div className="p-1.5 rounded-xl bg-blue-500/20 text-blue-400 shrink-0">
                  <Info className="w-5 h-5" />
                </div>
              )}
              <p className="text-xs sm:text-sm font-bold leading-snug">{toast.message}</p>
            </div>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors shrink-0 ml-2"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
