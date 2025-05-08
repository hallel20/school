import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

const PageHeader = ({ title, subtitle, actions }: PageHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between p-4 mb-4 border-b border-gray-200 dark:border-gray-700">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{title}</h1>
        {subtitle && <p className="text-gray-600 dark:text-gray-300 mt-1">{subtitle}</p>}
      </div>
      
      {actions && <div className="mt-3 md:mt-0">{actions}</div>}
    </div>
  );
};

export default PageHeader;