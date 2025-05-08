import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import { Home, AlertTriangle } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto" />
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          404 - Page Not Found
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          The page you are looking for doesn't exist or has been moved.
        </p>
        
        <div className="mt-8">
          <Link to="/">
            <Button variant="primary" leftIcon={<Home size={18} />}>
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;