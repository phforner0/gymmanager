import React from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { Toast as ToastType } from '../../types';

interface ToastProps {
  toast: ToastType;
}

export const Toast: React.FC<ToastProps> = ({ toast }) => {
  return (
    <div className="toast">
      {toast.type === 'success' && <CheckCircle size={20} color="var(--success)" />}
      {toast.type === 'error' && <AlertCircle size={20} color="var(--accent)" />}
      {toast.type === 'info' && <AlertCircle size={20} color="var(--info)" />}
      <span>{toast.message}</span>
    </div>
  );
};

interface ToastContainerProps {
  toasts: ToastType[];
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts }) => {
  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} />
      ))}
    </div>
  );
};