import React, { Suspense, lazy } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Spinner from './components/ui/Spinner';
import Providers from './Providers';
import { ErrorBoundary } from './components/ErrorBoundary';

// Lazy load page components
const Login = lazy(() => import('./pages/Login'));
const StudentDashboard = lazy(() => import('./pages/student/Dashboard'));
const StaffDashboard = lazy(() => import('./pages/staff/Dashboard'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const NotFound = lazy(() => import('./pages/NotFound'));

interface Props {
  children: React.ReactNode;
  allowedRoles?: string[];
}

// Protected route component
const ProtectedRoute = ({ children, allowedRoles }: Props) => {
  const { user, isAuthenticated, sessionLoading } = useAuth();

  if (sessionLoading) {
    return <Spinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user!.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Providers>
          <Suspense fallback={<Spinner />}>
            <Routes>
              <Route path="/login" element={<Login />} />

              <Route
                path="/student/*"
                element={
                  <ProtectedRoute allowedRoles={['Student']}>
                    <StudentDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/staff/*"
                element={
                  <ProtectedRoute allowedRoles={['Staff']}>
                    <StaffDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/*"
                element={
                  <ProtectedRoute allowedRoles={['Admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              <Route path="/unauthorized" element={<div>Unauthorized</div>} />
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </Providers>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
