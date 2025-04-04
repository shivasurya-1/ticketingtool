// ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import { login } from './authencationSlicer';


const ProtectedRoute = ({ children }) => {
  const dispatch = useDispatch();
  const [isChecking, setIsChecking] = useState(true);
  const isAuthenticated = useSelector((state) => state.authentication.isAuthenticated);

  // Helper function to get cookies
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  };

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        // Check for auth token in localStorage
        const authToken = localStorage.getItem('access_token') || getCookie('authToken');
        console.log('Auth Token:', authToken);
        
        if (authToken && !isAuthenticated) {
          // Verify token validity with your backend
          const response = await fetch('YOUR_API_ENDPOINT/verify-token', {
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            // Token is valid, update Redux state
            dispatch(login());
          } else {
            // Token is invalid, clear storage
            localStorage.removeItem('authToken');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('access_token');
          }
        }
      } catch (error) {
        console.error('Error verifying token:', error);
        // Clear storage on error
        localStorage.removeItem('authToken');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('access_token');
      } finally {
        setIsChecking(false);
      }
    };

    verifyAuth();
  }, [dispatch, isAuthenticated]);

  if (isChecking) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-600">Loading...</div>
      </div>
    ); // You can replace this with a proper loading component
  }

  // Check authentication status
  const authToken = localStorage.getItem('access_token') || getCookie('authToken');
  if (!isAuthenticated || !authToken) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;