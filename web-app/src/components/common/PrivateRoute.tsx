import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

interface PrivateRouteProps {
  children: React.ReactElement;
  requireProfileComplete?: boolean;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ 
  children, 
  requireProfileComplete = true 
}) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireProfileComplete && user && !user.isProfileComplete) {
    return <Navigate to="/register/complete-profile" replace />;
  }

  return children;
};

export default PrivateRoute;
