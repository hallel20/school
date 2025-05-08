import { ReactNode } from 'react';

interface CardProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  footer?: ReactNode;
  noPadding?: boolean;
}

const Card = ({ title, subtitle, children, className = '', footer, noPadding = false }: CardProps) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}>
      {(title || subtitle) && (
        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          {title && <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{title}</h3>}
          {subtitle && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{subtitle}</p>}
        </div>
      )}
      
      <div className={noPadding ? '' : 'p-5'}>
        {children}
      </div>
      
      {footer && (
        <div className="px-5 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;