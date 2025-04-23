// Adapted from shadcn/ui: https://ui.shadcn.com/docs/components/toast
import { createContext, useContext, useState } from "react";

const ToastContext = createContext({});

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const toast = ({ title, description, variant = "default", duration = 5000 }) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = {
      id,
      title,
      description,
      variant,
    };

    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, duration);

    return id;
  };

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast, dismissToast }}>
      {children}
      {/* Toast container */}
      {toasts.length > 0 && (
        <div className="fixed bottom-0 right-0 z-50 p-4 space-y-4 max-w-md w-full">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={`rounded-lg shadow-lg p-4 flex items-start space-x-4 animate-in slide-in-from-right-full 
                ${
                  t.variant === "destructive"
                    ? "bg-red-500 text-white"
                    : t.variant === "success"
                    ? "bg-green-500 text-white"
                    : "bg-white text-slate-950 dark:bg-slate-800 dark:text-white"
                }`}
            >
              <div className="flex-1">
                {t.title && <h4 className="font-semibold mb-1">{t.title}</h4>}
                {t.description && <p className="text-sm">{t.description}</p>}
              </div>
              <button
                onClick={() => dismissToast(t.id)}
                className="text-sm hover:opacity-80"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}; 