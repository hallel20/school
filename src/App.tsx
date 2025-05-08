import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import StudentDashboard from './pages/student/Dashboard';
import StaffDashboard from './pages/staff/Dashboard';
import AdminDashboard from './pages/admin/Dashboard';
import NotFound from './pages/NotFound';

// Protected route component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return children;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
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
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;