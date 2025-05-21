import React, { InputHTMLAttributes, useState, useEffect } from 'react';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface GlassInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
  clearIcon?: React.ReactNode;
  error?: string;
  status?: 'loading' | 'success' | 'error' | null;
}

const GlassInput: React.FC<GlassInputProps> = ({ 
  label, 
  icon,
  clearIcon, 
  error, 
  className = '', 
  status,
  ...props 
}) => {
  const [isFocused, setIsFocused] = useState(false);
  
  // Add custom styles to the document to handle autofill
  useEffect(() => {
    // Create a style element
    const style = document.createElement('style');
    // Add CSS rules for autofilled inputs
    style.innerHTML = `
      input:-webkit-autofill,
      input:-webkit-autofill:hover,
      input:-webkit-autofill:focus,
      input:-webkit-autofill:active {
        -webkit-background-clip: text !important;
        -webkit-text-fill-color: #ffffff !important;
        transition: background-color 5000s ease-in-out 0s;
        box-shadow: inset 0 0 20px 20px rgba(17, 24, 39, 0.8) !important;
        background-color: transparent !important;
        caret-color: white;
      }
    `;
    // Append the style to the head
    document.head.appendChild(style);
    
    // Clean up the style element on component unmount
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="mb-4">
      {label && (
        <label className="block text-white/80 mb-2 font-medium">
          {label}
        </label>
      )}
      
      <div className="relative">
        {/* Original icon layer */}
        {icon && (
          <div 
            className="absolute left-3 top-1/2" 
            style={{
              transform: 'translateY(-50%)',
              textRendering: 'geometricPrecision',
              WebkitFontSmoothing: 'subpixel-antialiased',
              MozOsxFontSmoothing: 'grayscale'
            }}
          >
            {icon}
          </div>
        )}
        
        {/* Clear icon layer with better positioning */}
        {clearIcon && (
          <div 
            className="absolute left-3 top-1/2 z-10" 
            style={{
              transform: 'translateY(-50%)',
              filter: 'none',
              WebkitFontSmoothing: 'auto'
            }}
          >
            {clearIcon}
          </div>
        )}
        
        <input
          className={`glass-input w-full ${(icon || clearIcon) ? 'pl-12' : ''} ${
            error ? 'border-error-500' : ''
          } ${isFocused ? 'ring-2 ring-primary-500/60 shadow-[0_0_10px_2px_rgba(59,130,246,0.3)]' : ''} 
          ${status === 'loading' ? 'border-warning-500/50' : ''}
          ${status === 'success' ? 'border-success-500/50' : ''}
          ${status === 'error' ? 'border-error-500/50' : ''}
          ${className}`}
          onFocus={(e) => {
            setIsFocused(true);
            if (props.onFocus) props.onFocus(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            if (props.onBlur) props.onBlur(e);
          }}
          style={{
            backgroundColor: 'transparent',
            color: '#ffffff'
          }}
          {...props}
        />
        
        {/* Status indicators */}
        {status && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            {status === 'loading' && (
              <Loader2 size={16} className="animate-spin text-warning-400" />
            )}
            {status === 'success' && (
              <CheckCircle size={16} className="text-success-400" />
            )}
            {status === 'error' && (
              <AlertCircle size={16} className="text-error-400" />
            )}
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-1 text-error-400 text-sm">{error}</p>
      )}
    </div>
  );
};

export default GlassInput;
