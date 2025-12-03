import React from 'react';
import { X, AlertCircle } from 'lucide-react';
import { ButtonProps, BadgeProps, ModalProps, ToastProps } from '../../types';

// Button Component
export function Button({ 
  children, 
  onClick, 
  className = '', 
  disabled = false,
  variant = 'primary',
  size = 'md',
  ...props 
}: ButtonProps) {
  const variantClass = variant === 'ghost' ? 'ghost' : variant === 'success' ? 'success' : '';
  const sizeClass = size === 'sm' ? 'sm' : '';
  
  return (
    <button 
      className={`btn ${variantClass} ${sizeClass} ${className}`} 
      onClick={onClick} 
      disabled={disabled} 
      {...props}
    >
      {children}
    </button>
  );
}

// Badge Component
export function Badge({ children, variant = 'primary' }: BadgeProps) {
  return <span className={`badge ${variant}`}>{children}</span>;
}

// Modal Component
export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 id="modal-title">{title}</h3>
          <button className="modal-close" onClick={onClose} aria-label="Fechar modal">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// Toast Component
export function Toast({ message }: ToastProps) {
  if (!message) return null;

  return (
    <div className="toast" role="status" aria-live="polite">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <AlertCircle size={20} />
        {message}
      </div>
    </div>
  );
}