import { SelectHTMLAttributes, forwardRef, ReactNode } from 'react';

interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ 
    label, 
    options, 
    error, 
    helperText, 
    fullWidth = false, 
    leftIcon, 
    className = '', 
    ...rest 
  }, ref) => {
    const baseSelectClasses = `
      block
      rounded-lg
      border
      text-sm
      focus:outline-none
      focus:ring-2
      focus:ring-offset-2
      transition-colors
      appearance-none
      ${error 
        ? 'border-red-300 text-red-700 focus:ring-red-500 focus:border-red-500 dark:border-red-700 dark:text-red-400' 
        : 'border-gray-300 text-gray-700 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:text-white dark:bg-gray-700'}
      ${leftIcon ? 'pl-10' : 'pl-3'}
      pr-10
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
          
          <select
            ref={ref}
            className={baseSelectClasses}
            {...rest} 
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500 dark:text-gray-400">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path>
            </svg>
          </div>
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

export default Select;