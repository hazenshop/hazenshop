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
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Notification Container positioned prominently */}
      <div
        aria-live="polite"
        className="fixed top-4 right-4 left-4 sm:left-auto sm:top-6 sm:right-6 z-[99999] flex flex-col gap-2.5 max-w-md w-auto sm:w-full pointer-events-none"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="alert"
            className={`pointer-events-auto flex items-start sm:items-center justify-between p-3.5 sm:p-4 rounded-2xl shadow-2xl border backdrop-blur-xl transition-all duration-300 animate-in slide-in-from-top-3 fade-in ${
              toast.type === "success"
                ? "bg-slate-900/95 border-emerald-500/50 text-emerald-100 ring-1 ring-emerald-500/20"
                : toast.type === "error"
                ? "bg-slate-900/95 border-rose-500/50 text-rose-100 ring-1 ring-rose-500/20"
                : toast.type === "warning"
                ? "bg-slate-900/95 border-amber-500/50 text-amber-100 ring-1 ring-amber-500/20"
                : "bg-slate-900/95 border-slate-700 text-white ring-1 ring-white/10"
            }`}
          >
            <div className="flex items-start sm:items-center gap-3 pr-2">
              {toast.type === "success" && (
                <div className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0 mt-0.5 sm:mt-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              )}
              {toast.type === "error" && (
                <div className="p-1 rounded-lg bg-rose-500/20 text-rose-400 shrink-0 mt-0.5 sm:mt-0">
                  <AlertCircle className="w-4 h-4" />
                </div>
              )}
              {toast.type === "warning" && (
                <div className="p-1 rounded-lg bg-amber-500/20 text-amber-400 shrink-0 mt-0.5 sm:mt-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              )}
              {toast.type === "info" && (
                <div className="p-1 rounded-lg bg-blue-500/20 text-blue-400 shrink-0 mt-0.5 sm:mt-0">
                  <Info className="w-4 h-4" />
                </div>
              )}
              <p className="text-xs sm:text-sm font-semibold leading-snug">{toast.message}</p>
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
