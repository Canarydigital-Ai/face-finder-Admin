import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from './redux';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, token } = useAppSelector((state) => state.tutor);
  const location = useLocation();

  // If user is not authenticated or doesn't have a token, redirect to login
  if (!isAuthenticated || !token) {
    return <Navigate to="/tutor/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;