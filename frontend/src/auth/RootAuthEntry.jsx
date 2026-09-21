import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import LoadingScreen from '../components/LoadingScreen';

/**
 * RootAuthEntry Component
 *
 * Handles routing logic for the `/` root route:
 * - initializing: displays loading screen
 * - authenticated: navigates directly to `/dashboard`
 * - unauthenticated: immediately triggers Keycloak login redirect
 */
function RootAuthEntry() {
  const { initializing, authenticated, login } = useAuth();

  useEffect(() => {
    if (!initializing && !authenticated) {
      login();
    }
  }, [initializing, authenticated, login]);

  if (initializing) {
    return <LoadingScreen message="Initializing session..." />;
  }

  if (authenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <LoadingScreen message="Redirecting to login..." />;
}

export default RootAuthEntry;
