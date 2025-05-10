import Button from '../components/ui/Button';

function InternalServerError() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">
          Oops!
        </h1>
        <h2 className="mt-6 text-2xl font-bold text-gray-900 dark:text-white">
          Something went wrong.
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Our servers encountered an unexpected error. Please try again.
        </p>

        <div className="mt-8">
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    </div>
  );
}

export default InternalServerError;
