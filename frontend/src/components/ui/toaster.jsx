import React from "react";
import { useToast } from "./use-toast";

export function Toaster() {
  const { toasts, dismissToast } = useToast();

  return (
    <div className="fixed bottom-0 right-0 z-50 p-4 space-y-4 max-w-md w-full">
      {toasts?.map((toast) => (
        <div
          key={toast.id}
          className={`rounded-lg shadow-lg p-4 flex items-start space-x-4 animate-in slide-in-from-right-full 
            ${
              toast.variant === "destructive"
                ? "bg-red-500 text-white"
                : toast.variant === "success"
                ? "bg-green-500 text-white"
                : "bg-white text-slate-950 dark:bg-slate-800 dark:text-white"
            }`}
        >
          <div className="flex-1">
            {toast.title && <h4 className="font-semibold mb-1">{toast.title}</h4>}
            {toast.description && <p className="text-sm">{toast.description}</p>}
          </div>
          <button
            onClick={() => dismissToast(toast.id)}
            className="text-sm hover:opacity-80"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
} 