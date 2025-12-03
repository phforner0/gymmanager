import { ButtonProps } from "@/types";

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