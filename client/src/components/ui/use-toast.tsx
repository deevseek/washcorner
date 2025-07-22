import React, { createContext, useContext, useState, ReactNode } from "react";

type ToastType = "default" | "destructive";

interface Toast {
  id: number;
  title: string;
  description?: string;
  variant?: ToastType;
}

interface ToastContextValue {
  toast: (toast: Omit<Toast, "id">) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

let toastId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = ({
    title,
    description,
    variant = "default",
  }: Omit<Toast, "id">) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, title, description, variant }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast container */}
      <div
        style={{
          position: "fixed",
          top: 10,
          right: 10,
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        {toasts.map(({ id, title, description, variant }) => (
          <div
            key={id}
            style={{
              minWidth: 250,
              padding: "12px 16px",
              borderRadius: 4,
              color: variant === "destructive" ? "white" : "black",
              backgroundColor:
                variant === "destructive" ? "#f87171" : "#d1fae5",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              fontWeight: "bold",
            }}
          >
            <div>{title}</div>
            {description && (
              <div style={{ fontWeight: "normal", marginTop: 4 }}>
                {description}
              </div>
            )}
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
