// ProtectedRoute.js
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token'); // Check if the token exists

  if (!token) {
    // If not authenticated, redirect to login
    return <Navigate to="/" replace />;
  }

  // If authenticated, render the children (protected component)
  return children;
};

export default ProtectedRoute;