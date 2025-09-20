import React from "react";
import { useNotifications } from "../contexts/NotificationContext";
import Toast from "./Toast";

const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useNotifications();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 pointer-events-none">
      <div className="flex flex-col space-y-3 pointer-events-auto">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="animate-slide-in-right"
            style={{
              animation: "slide-in-right 0.3s ease-out forwards",
            }}
          >
            <Toast
              id={toast.id}
              title={toast.title}
              message={toast.message}
              type={toast.type}
              duration={toast.duration}
              onClose={removeToast}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ToastContainer;
