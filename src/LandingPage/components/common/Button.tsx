import React, { ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  disabled?: boolean;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  type = 'button',
  className = '',
  disabled = false,
  fullWidth = false
}) => {
  const baseClass = 'btn';
  const variantClass = `btn-${variant}`;
  const widthClass = fullWidth ? 'w-full' : '';
  const combinedClass = `${baseClass} ${variantClass} ${widthClass} ${className}`.trim();

  return (
    <button
      type={type}
      className={combinedClass}
      onClick={onClick}
      disabled={disabled}
      style={fullWidth ? { width: '100%' } : undefined}
    >
      {children}
    </button>
  );
};