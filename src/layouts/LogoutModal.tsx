import React, { useState } from 'react';
import { LogOut, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../hooks/redux'; 
import { logout } from '../../store/slices/tutorSlice'; 
import { toast } from 'react-toastify';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void; // Make this optional since we'll handle logout internally
  userName?: string;
}

export const LogoutModal: React.FC<LogoutModalProps> = ({
  isOpen,
  onClose,
  // onConfirm, // Keep for backward compatibility
  userName = "User"
}) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isLoggingOut) {
      onClose();
    }
  };

  // ENHANCED LOGOUT WITH FORCE IMPLEMENTATION
  const handleLogout = async () => {
    setIsLoggingOut(true);

    
    try {


      
      // Redux logout
      dispatch(logout());
      
      // Clear all storage manually
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear specific items if they exist
      const keysToRemove = ['authToken', 'userEmail', 'persist:tutor', 'persist:root'];
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      // Try to purge persistor
      try {
        const { persistor } = await import('../../store/slices'); // Adjust path
        await persistor.purge();
        await persistor.flush();

      } catch (persistError) {
        console.warn('⚠️ Persistor clear failed:', persistError);
      }
      
      toast.success('Logged out successfully');
      onClose();
    
      navigate('/tutor/login', { replace: true });
      
      // Backup navigation
      setTimeout(() => {
        if (window.location.pathname !== '/tutor/login') {
          window.location.href = '/tutor/login';
        }
      }, 100);
      
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Force everything
      localStorage.clear();
      sessionStorage.clear();
      toast.success('Logged out');
      onClose();
      window.location.href = '/tutor/login';
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <LogOut className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Confirm Logout</h3>
          </div>
          {!isLoggingOut && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600 mb-2">
            Are you sure you want to logout, <span className="font-medium text-gray-900">{userName}</span>?
          </p>
          <p className="text-sm text-gray-500">
            You will be redirected to the login page and need to sign in again to access your dashboard.
          </p>
          
          {isLoggingOut && (
            <div className="mt-4 flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
              <span className="ml-2 text-sm text-gray-600">Logging out...</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <button
            onClick={onClose}
            disabled={isLoggingOut}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoggingOut ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Logging out...</span>
              </>
            ) : (
              <>
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};