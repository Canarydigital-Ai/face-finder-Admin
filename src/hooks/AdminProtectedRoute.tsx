import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../hooks/redux';
import { setAdminAuth, clearAdminAuth } from '../store/slices/adminSlice';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { isAuthenticated, token } = useAppSelector((state) => state.admin);
  
  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    const userEmail = localStorage.getItem('userEmail');
    
    if (authToken && userEmail && !isAuthenticated) {
      dispatch(setAdminAuth({
        token: authToken,
        user: {
          id: 'admin',
          email: userEmail,
          name: 'Admin',
          role: 'admin'
        }
      }));
    } else if (!authToken && isAuthenticated) {
      dispatch(clearAdminAuth());
    }
  }, [dispatch, isAuthenticated]);


  const authToken = localStorage.getItem('authToken');
  const userEmail = localStorage.getItem('userEmail');
  const isAdminAuthenticated = (authToken && userEmail) || (isAuthenticated && token);
  
  if (!isAdminAuthenticated) {

    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    dispatch(clearAdminAuth());

    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
};

export default AdminProtectedRoute;

