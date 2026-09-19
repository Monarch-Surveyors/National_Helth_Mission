import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import LoginPage from '../pages/LoginPage';
import LoadingScreen from '../components/LoadingScreen';

/**
 * RootAuthEntry Component
 *
 * Handles routing logic for the `/` root route:
 * - initializing: displays loading screen
 * - authenticated: navigates to `/dashboard`
 * - unauthenticated: renders `LoginPage`
 */
function RootAuthEntry() {
  const { initializing, authenticated } = useAuth();

  if (initializing) {
    return <LoadingScreen message="Initializing session..." />;
  }

  if (authenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <LoginPage />;
}

export default RootAuthEntry;

