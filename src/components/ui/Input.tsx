import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    label, 
    error, 
    helperText, 
    fullWidth = false, 
    leftIcon, 
    rightIcon, 
    className = '', 
    ...rest 
  }, ref) => {
    const baseInputClasses = `
      block
      rounded-lg
      border
      text-sm
      focus:outline-none
      focus:ring-2
      focus:ring-offset-2
      transition-colors
      placeholder-gray-400
      ${error 
        ? 'border-red-300 text-red-700 focus:ring-red-500 focus:border-red-500 dark:border-red-700 dark:text-red-400' 
        : 'border-gray-300 text-gray-700 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:text-white dark:bg-gray-700'}
      ${leftIcon ? 'pl-10' : 'pl-3'}
      ${rightIcon ? 'pr-10' : 'pr-3'}
      py-2
      ${fullWidth ? 'w-full' : ''}
      ${className}
    `;

    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label 
            htmlFor={rest.id} 
            className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500 dark:text-gray-400">
              {leftIcon}
            </div>
          )}
          
          <input
            ref={ref}
            className={baseInputClasses}
            {...rest} 
          />
          
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500 dark:text-gray-400">
              {rightIcon}
            </div>
          )}
        </div>
        
        {(error || helperText) && (
          <p className={`mt-1 text-sm ${error ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

export default Input;