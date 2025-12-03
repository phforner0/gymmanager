import React from 'react';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { ToastType } from '../types';

interface ToastProps {
  toasts: ToastType[];
}

export const Toast: React.FC<ToastProps> = ({ toasts }) => {
  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <div key={toast.id} className={`toast ${toast.type}`}>
          {toast.type === 'success' && <CheckCircle size={20} />}
          {toast.type === 'error' && <XCircle size={20} />}
          {toast.type === 'info' && <AlertCircle size={20} />}
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );
};