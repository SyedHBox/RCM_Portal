import React, { ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  className = '',
  isLoading = false,
  icon,
  ...props
}) => {
  // Use the existing btn-* classes from index.css only if no custom class is provided that overrides it
  const baseClass = !className.includes('bg-gradient-to-r') ? `btn-${variant}` : '';
  
  return (
    <button
      className={`${baseClass} relative backdrop-blur-md rounded-lg ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {/* Content container */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : icon ? (
          <span className="flex items-center">{icon}</span>
        ) : null}
        
        {children}
      </span>
    </button>
  );
};

export default Button;
