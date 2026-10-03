import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <LoadingSpinner text="Authenticating session..." size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    // Redirect to user's native dashboard if role mismatch
    if (user?.role === 'candidate') return <Navigate to="/candidate/dashboard" replace />;
    if (user?.role === 'recruiter') return <Navigate to="/recruiter/dashboard" replace />;
    if (user?.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
