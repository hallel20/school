import { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
// import { useAuth } from '../../hooks/useAuth';
import Sidebar from '../../components/ui/Sidebar';
import Spinner from '../../components/ui/Spinner'; // Import the Spinner

// Lazy load dashboard page components
const Overview = lazy(() => import('./Overview'));
const Users = lazy(() => import('./Users'));
const Courses = lazy(() => import('./Courses'));
const Departments = lazy(() => import('./Departments'));
const Faculties = lazy(() => import('./Faculties'));
const Staff = lazy(() => import('./Staff'));
const Students = lazy(() => import('./Students'));
// const Results = lazy(() => import('./Results'));
const AcademicSessions = lazy(() => import('./AcademicSessions'));
const Settings = lazy(() => import('./Settings'));
const NotFound = lazy(() => import('../NotFound'));

const AdminDashboard = () => {
  // const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return (
    <div className="h-screen flex flex-col md:flex-row bg-gray-100 dark:bg-gray-900">
      {/* Mobile menu button */}
      <div className="md:hidden p-4 bg-white dark:bg-gray-800 shadow-sm">
        <button
          className="text-gray-600 dark:text-gray-300 focus:outline-none"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <svg
            className="h-6 w-6"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {isMobileMenuOpen ? (
              <path d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`
        md:block
        ${isMobileMenuOpen ? 'block' : 'hidden'}
        md:static fixed inset-0 z-10
        bg-white dark:bg-gray-800
      `}
      >
        <Sidebar role="Admin" />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto pb-10 max-w-full">
          <Suspense fallback={<Spinner />}>
            <Routes>
              <Route path="/" element={<Overview />} />
              <Route path="/users/*" element={<Users />} />
              <Route path="/staff/*" element={<Staff />} />
              <Route path="/students/*" element={<Students />} />
              <Route path="/courses/*" element={<Courses />} />
              <Route path="/faculties/*" element={<Faculties />} />
              <Route path="/departments/*" element={<Departments />} />
              <Route
                path="/academic-sessions/*"
                element={<AcademicSessions />}
              />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
