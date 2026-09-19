import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';
import LoadingScreen from '../components/LoadingScreen';

/**
 * ProtectedRoute Component
 *
 * Protects application routes from unauthenticated access.
 * If unauthenticated, navigates unconditionally to `/` without preserving return route.
 */
function ProtectedRoute({ children }) {
  const { initializing, authenticated } = useAuth();

  if (initializing) {
    return <LoadingScreen message="Verifying authentication..." />;
  }

  if (!authenticated) {
    return <Navigate to="/" replace />;
  }

  return children ? children : <Outlet />;
}

export default ProtectedRoute;

